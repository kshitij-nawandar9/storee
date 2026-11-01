package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"storee/backend/models"
	"storee/backend/services"
	"storee/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Default parcel dimensions used when the admin doesn't override them.
const (
	defaultParcelLengthCM  = 10
	defaultParcelBreadthCM = 10
	defaultParcelHeightCM  = 10
	defaultParcelWeightKG  = 0.5
)

type ShippingHandler struct {
	DB             *gorm.DB
	Shiprocket     *services.ShiprocketClient
	PickupLocation string
}

func NewShippingHandler(db *gorm.DB, client *services.ShiprocketClient, pickupLocation string) *ShippingHandler {
	return &ShippingHandler{DB: db, Shiprocket: client, PickupLocation: pickupLocation}
}

type ShipOrderRequest struct {
	// Parcel details in cm/kg; all optional, sensible defaults applied.
	Length  float64 `json:"length"`
	Breadth float64 `json:"breadth"`
	Height  float64 `json:"height"`
	Weight  float64 `json:"weight"`
}

// orderAddress mirrors the address JSON stored on an order.
type orderAddress struct {
	Line1   string `json:"line1"`
	Line2   string `json:"line2"`
	City    string `json:"city"`
	State   string `json:"state"`
	Pincode string `json:"pincode"`
}

// orderItem mirrors the item JSON stored on an order, including the
// fallback locations the frontend uses for name/price/sku.
type orderItem struct {
	Name     string `json:"name"`
	SKU      string `json:"sku"`
	Quantity int    `json:"quantity"`
	Price    int64  `json:"price"` // in paise
	Product  struct {
		Name      string `json:"name"`
		BasePrice int64  `json:"basePrice"`
	} `json:"product"`
	Variant struct {
		Price int64  `json:"price"`
		SKU   string `json:"sku"`
	} `json:"variant"`
}

// BuildShiprocketOrder maps a store order to a Shiprocket adhoc order payload.
func BuildShiprocketOrder(order *models.Order, pickupLocation string, req ShipOrderRequest) (*services.ShiprocketOrderRequest, error) {
	var addr orderAddress
	if err := json.Unmarshal(order.Address, &addr); err != nil {
		return nil, fmt.Errorf("failed to parse order address: %w", err)
	}
	if addr.Line1 == "" || addr.City == "" || addr.State == "" || addr.Pincode == "" {
		return nil, fmt.Errorf("order address is incomplete")
	}

	var items []orderItem
	if err := json.Unmarshal(order.Items, &items); err != nil {
		return nil, fmt.Errorf("failed to parse order items: %w", err)
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("order has no items")
	}

	srItems := make([]services.ShiprocketOrderItem, 0, len(items))
	for i, item := range items {
		name := item.Name
		if name == "" {
			name = item.Product.Name
		}
		if name == "" {
			name = fmt.Sprintf("Item %d", i+1)
		}
		price := item.Price
		if price == 0 {
			price = item.Variant.Price
		}
		if price == 0 {
			price = item.Product.BasePrice
		}
		sku := item.SKU
		if sku == "" {
			sku = item.Variant.SKU
		}
		if sku == "" {
			sku = fmt.Sprintf("%s-%d", order.OrderID, i+1)
		}
		qty := item.Quantity
		if qty < 1 {
			qty = 1
		}
		srItems = append(srItems, services.ShiprocketOrderItem{
			Name:         name,
			SKU:          sku,
			Units:        qty,
			SellingPrice: float64(price) / 100, // paise -> rupees
		})
	}

	// Shiprocket wants first and last name separately.
	firstName, lastName := order.CustomerName, ""
	if idx := strings.Index(strings.TrimSpace(order.CustomerName), " "); idx > 0 {
		trimmed := strings.TrimSpace(order.CustomerName)
		firstName, lastName = trimmed[:idx], strings.TrimSpace(trimmed[idx+1:])
	}

	paymentMethod := "Prepaid"
	if order.PaymentMethod == "cod" {
		paymentMethod = "COD"
	}

	if req.Length <= 0 {
		req.Length = defaultParcelLengthCM
	}
	if req.Breadth <= 0 {
		req.Breadth = defaultParcelBreadthCM
	}
	if req.Height <= 0 {
		req.Height = defaultParcelHeightCM
	}
	if req.Weight <= 0 {
		req.Weight = defaultParcelWeightKG
	}

	return &services.ShiprocketOrderRequest{
		OrderID:             order.OrderID,
		OrderDate:           order.CreatedAt.Format("2006-01-02 15:04"),
		PickupLocation:      pickupLocation,
		BillingCustomerName: firstName,
		BillingLastName:     lastName,
		BillingAddress:      addr.Line1,
		BillingAddress2:     addr.Line2,
		BillingCity:         addr.City,
		BillingPincode:      addr.Pincode,
		BillingState:        addr.State,
		BillingCountry:      "India",
		BillingEmail:        order.CustomerEmail,
		BillingPhone:        order.CustomerPhone,
		ShippingIsBilling:   true,
		OrderItems:          srItems,
		PaymentMethod:       paymentMethod,
		SubTotal:            float64(order.TotalAmount) / 100, // paise -> rupees
		Length:              req.Length,
		Breadth:             req.Breadth,
		Height:              req.Height,
		Weight:              req.Weight,
	}, nil
}

// ShipOrder handles POST /api/v1/admin/orders/:id/ship — pushes the order to
// Shiprocket and stores the returned shipment identifiers.
func (h *ShippingHandler) ShipOrder(c *gin.Context) {
	if !h.Shiprocket.Configured() {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.", nil)
		return
	}

	var req ShipOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request data", err)
		return
	}

	orderID := c.Param("id")
	var order models.Order
	if err := h.DB.Where("id = ? OR order_id = ?", orderID, orderID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch order", err)
		return
	}

	if order.ShipmentID != "" {
		utils.ErrorResponse(c, http.StatusConflict, fmt.Sprintf("Order already has a Shiprocket shipment (shipment ID %s)", order.ShipmentID), nil)
		return
	}
	switch order.Status {
	case "shipped", "delivered", "cancelled":
		utils.ErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("Cannot create a shipment for a %s order", order.Status), nil)
		return
	case "pending":
		// A pending razorpay order hasn't been paid yet; COD orders start
		// (and legitimately ship from) pending.
		if order.PaymentMethod != "cod" {
			utils.ErrorResponse(c, http.StatusBadRequest, "Cannot ship an unpaid order", nil)
			return
		}
	}

	srReq, err := BuildShiprocketOrder(&order, h.PickupLocation, req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), err)
		return
	}

	srResp, err := h.Shiprocket.CreateOrder(srReq)
	if err != nil {
		log.Printf("Shiprocket order creation failed for order %s: %v", order.OrderID, err)
		utils.ErrorResponse(c, http.StatusBadGateway, "Failed to create shipment in Shiprocket", err)
		return
	}
	log.Printf("Shiprocket order created for order %s: shiprocket_order_id=%s shipment_id=%s", order.OrderID, srResp.OrderID, srResp.ShipmentID)

	order.ShiprocketOrderID = srResp.OrderID.String()
	order.ShipmentID = srResp.ShipmentID.String()
	order.AWBCode = srResp.AWBCode
	order.CourierName = srResp.CourierName
	// The shipment is being arranged (AWB assignment + pickup happen in
	// Shiprocket); reflect that the order is now in fulfilment.
	if order.Status == "pending" || order.Status == "paid" {
		order.Status = "processing"
	}
	if err := h.DB.Save(&order).Error; err != nil {
		log.Printf("Failed to save Shiprocket IDs for order %s: %v", order.OrderID, err)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Shipment created in Shiprocket but failed to save details", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Shipment created in Shiprocket", order)
}

// GetTracking handles GET /api/v1/admin/orders/:id/tracking — fetches live
// tracking from Shiprocket and backfills AWB/courier on the order.
func (h *ShippingHandler) GetTracking(c *gin.Context) {
	if !h.Shiprocket.Configured() {
		utils.ErrorResponse(c, http.StatusServiceUnavailable, "Shiprocket is not configured. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD.", nil)
		return
	}

	orderID := c.Param("id")
	var order models.Order
	if err := h.DB.Where("id = ? OR order_id = ?", orderID, orderID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Order not found", nil)
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch order", err)
		return
	}
	if order.ShipmentID == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Order has no Shiprocket shipment yet", nil)
		return
	}

	tracking, err := h.Shiprocket.TrackShipment(order.ShipmentID)
	if err != nil {
		log.Printf("Shiprocket tracking failed for order %s (shipment %s): %v", order.OrderID, order.ShipmentID, err)
		utils.ErrorResponse(c, http.StatusBadGateway, "Failed to fetch tracking from Shiprocket", err)
		return
	}

	// Backfill AWB/courier once Shiprocket assigns them.
	if len(tracking.TrackingData.ShipmentTrack) > 0 {
		track := tracking.TrackingData.ShipmentTrack[0]
		if track.AWBCode != "" && (order.AWBCode != track.AWBCode || order.CourierName != track.CourierName) {
			order.AWBCode = track.AWBCode
			order.CourierName = track.CourierName
			if err := h.DB.Save(&order).Error; err != nil {
				log.Printf("Failed to backfill AWB for order %s: %v", order.OrderID, err)
			}
		}
	}

	utils.SuccessResponse(c, http.StatusOK, "Tracking fetched successfully", gin.H{
		"order":    order,
		"tracking": tracking.TrackingData,
	})
}
