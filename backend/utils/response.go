package utils

import (
	"github.com/gin-gonic/gin"
)

type ApiResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, ApiResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func ErrorResponse(c *gin.Context, statusCode int, message string, err error) {
	response := ApiResponse{
		Success: false,
		Message: message,
		Data:    nil,
	}

	if err != nil {
		response.Data = gin.H{"error": err.Error()}
	}

	c.JSON(statusCode, response)
}
