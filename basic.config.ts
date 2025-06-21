
// Basic Project Configuration
// see  the docs for more info: https://docs.basic.tech
export const config = {
	name: "shopping-ai-avatar",
	project_id: "f66ac898-3ded-4b2a-b079-a3cc85dba583"
};

export const schema = {
		"project_id": "f66ac898-3ded-4b2a-b079-a3cc85dba583",
		"tables": {
			"chats": {
				"fields": {
					"created_at": {
						"type": "string"
					},
					"title": {
						"type": "string"
					}
				},
				"type": "collection"
			},
			"messages": {
				"fields": {
					"chat_id": {
						"type": "string"
					},
					"content": {
						"type": "string"
					},
					"created_at": {
						"type": "string"
					},
					"role": {
						"type": "string"
					}
				},
				"type": "collection"
			},
			"notes": {
				"description": "notes table",
				"fields": {
					"text": {
						"description": "main text value",
						"type": "string"
					}
				},
				"origin": {
					"project_id": "bc1f568d-62f5-437f-af3a-398d90db58e6",
					"table": "notes",
					"type": "reference"
				},
				"type": "collection"
			},
			"tasks": {
			"fields": {
				"completed": {
					"type": "boolean"
				},
				"description": {
					"type": "string"
				},
				"name": {
					"type": "string"
				}
			},
			"name": "tasks",
			"origin": {
				"project_id": "701b11bc-59a8-45b5-8148-7184d7733e5b",
				"table": "tasks",
				"type": "reference"
			},
			"type": "collection"
		},
		"products": {
			"description": "Product catalog for the shopping app",
			"fields": {
				"name": {
					"type": "string"
				},
				"description": {
					"type": "string"
				},
				"price": {
					"type": "number"
				},
				"category": {
					"type": "string"
				},
				"image_url": {
					"type": "string"
				},
				"stock_quantity": {
					"type": "number"
				},
				"created_at": {
					"type": "string"
				},
				"updated_at": {
					"type": "string"
				}
			},
			"type": "collection"
		},
		"customers": {
			"description": "Customer information",
			"fields": {
				"name": {
					"type": "string"
				},
				"email": {
					"type": "string"
				},
				"phone": {
					"type": "string"
				},
				"address": {
					"type": "string"
				},
				"created_at": {
					"type": "string"
				},
				"preferences": {
					"type": "string"
				}
			},
			"type": "collection"
		},
		"cart_items": {
			"description": "Shopping cart items",
			"fields": {
				"customer_id": {
					"type": "string"
				},
				"product_id": {
					"type": "string"
				},
				"quantity": {
					"type": "number"
				},
				"added_at": {
					"type": "string"
				},
				"session_id": {
					"type": "string"
				}
			},
			"type": "collection"
		},
		"orders": {
			"description": "Customer orders",
			"fields": {
				"customer_id": {
					"type": "string"
				},
				"total_amount": {
					"type": "number"
				},
				"status": {
					"type": "string"
				},
				"created_at": {
					"type": "string"
				},
				"shipping_address": {
					"type": "string"
				},
				"payment_method": {
					"type": "string"
				},
				"tracking_number": {
					"type": "string"
				}
			},
			"type": "collection"
		},
		"order_items": {
			"description": "Items within each order",
			"fields": {
				"order_id": {
					"type": "string"
				},
				"product_id": {
					"type": "string"
				},
				"quantity": {
					"type": "number"
				},
				"unit_price": {
					"type": "number"
				},
				"total_price": {
					"type": "number"
				}
			},
			"type": "collection"
		},
		"avatar_interactions": {
			"description": "AI avatar interaction logs and sessions",
			"fields": {
				"customer_id": {
					"type": "string"
				},
				"session_id": {
					"type": "string"
				},
				"avatar_type": {
					"type": "string"
				},
				"interaction_type": {
					"type": "string"
				},
				"user_input": {
					"type": "string"
				},
				"avatar_response": {
					"type": "string"
				},
				"created_at": {
					"type": "string"
				},
				"context_data": {
					"type": "string"
				},
				"sentiment_score": {
					"type": "number"
				},
				"products_mentioned": {
					"type": "string"
				}
			},
			"type": "collection"
		},
		"avatar_personas": {
			"description": "AI avatar personality configurations",
			"fields": {
				"name": {
					"type": "string"
				},
				"personality_traits": {
					"type": "string"
				},
				"voice_settings": {
					"type": "string"
				},
				"visual_appearance": {
					"type": "string"
				},
				"specialization": {
					"type": "string"
				},
				"greeting_message": {
					"type": "string"
				},
				"created_at": {
					"type": "string"
				},
				"is_active": {
					"type": "boolean"
				}
			},
			"type": "collection"
		}
		},
		"version": 2 
	}
	;
