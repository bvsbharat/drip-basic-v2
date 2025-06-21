# Tavus Integration for DevKit AI

This document provides instructions for integrating Tavus Conversational Video Interface (CVI) into the DevKit AI application.

## Overview

Tavus CVI allows for real-time video conversations with AI replicas. This integration replaces the previous Simli+Vapi implementation with Tavus's more advanced conversational video capabilities.

## Prerequisites

1. A Tavus account with API access
2. A Tavus replica ID and persona ID
3. Tavus API key

## Setup Instructions

### 1. Install Dependencies

The integration requires Daily.js for WebRTC communication:

```bash
npm install @daily-co/daily-js
```

### 2. Configure Environment Variables

Create or update your `.env.local` file with your Tavus API key:

```
NEXT_PUBLIC_TAVUS_API_KEY=your_tavus_api_key_here
```

### 3. Update Component Usage

Replace the `SimliVapi` component with the new `TavusClient` component in your application:

```jsx
import TavusClient from './Components/TavusClient';

// Replace this:
<SimliVapi 
  simli_faceid="your_simli_face_id"
  agentId="your_agent_id"
  onStart={handleStart}
  onClose={handleClose}
  showDottedFace={false}
  onMessageReceived={handleMessageReceived}
  onCartUpdate={handleCartUpdate}
  menuItems={menuItems}
  currentCart={cart}
/>

// With this:
<TavusClient 
  replicaId="rca8a38779a8"
  personaId="p8491bf32673"
  agentId="your_agent_id"
  onStart={handleStart}
  onClose={handleClose}
  onMessageReceived={handleMessageReceived}
  onCartUpdate={handleCartUpdate}
  menuItems={menuItems}
  currentCart={cart}
/>
```

## Getting Tavus Credentials

1. **Replica ID**: Create a replica in the Tavus platform and copy its ID
2. **Persona ID**: Create or select a persona in the Tavus platform and copy its ID
3. **API Key**: Generate an API key in the Tavus developer settings

## How It Works

The `TavusClient` component:

1. Creates a conversation via the Tavus API when the user clicks the microphone button
2. Initializes a Daily.js frame to join the conversation
3. Processes messages from the conversation to update the cart
4. Handles starting and stopping the conversation
5. Sends conversation transcripts to Coval for monitoring

## Customization

You can customize the conversation context, greeting, and other properties in the `createTavusConversation` function within the `TavusClient` component.

## Troubleshooting

- **Video not appearing**: Ensure the user has granted camera and microphone permissions
- **API errors**: Verify your Tavus API key is correct and has the necessary permissions
- **Connection issues**: Check network connectivity and firewall settings

## Additional Resources

- [Tavus Documentation](https://docs.tavus.io/)
- [Daily.js Documentation](https://docs.daily.co/reference/daily-js)
- [Tavus Examples Repository](https://github.com/Tavus-Engineering/tavus-examples)