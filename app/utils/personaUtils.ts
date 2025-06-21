const updatePersonaWithShoppingCartTool = async (personaId) => {
  const updateData = [
    {
      op: "replace",
      path: "/layers/llm/tools",
      value: [
        {
          type: "function",
          function: {
            name: "update_kart",
            description: "Use this tool to add, remove, or clear items in the user's shopping cart.",
            parameters: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  enum: ["add", "remove", "clear"],
                  description: "The action to perform: 'add', 'remove', or 'clear'."
                },
                itemName: {
                  type: "string",
                  description: "The name of the item to add or remove."
                },
                quantity: {
                  type: "number",
                  description: "The quantity of the item to add or remove."
                }
              },
              required: ["action"]
            }
          }
        }
      ]
    }
  ];

  const apiKey = process.env.NEXT_PUBLIC_TAVUS_API_KEY;

  try {
    const response = await fetch(`https://tavusapi.com/v2/personas/${personaId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Shopping cart tool updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating persona with shopping cart tool:', error);
    throw error;
  }
};

// Usage example
const updateShoppingCartPersona = async () => {
  const personaId = "your-persona-id-here"; // Replace with actual persona ID
  
  try {
    const result = await updatePersonaWithShoppingCartTool(personaId);
    console.log('Update successful:', result);
  } catch (error) {
    console.error('Update failed:', error);
  }
};

// Call the function

export { updatePersonaWithShoppingCartTool, updateShoppingCartPersona };