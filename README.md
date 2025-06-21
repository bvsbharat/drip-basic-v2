# DevKit.AI - Interactive Shopping Assistant @ built with SuperFlex.AI

DevKit.AI is an intelligent shopping assistant powered by Simli's AI and OpenAI's Real-time API.
It offers a seamless shopping experience with the help of **DevKit Assistant**, a friendly AI companion that guides users through their shopping journey. Whether you're searching for the best **developer tools** for your projects or need real-time assistance, DevKit.AI has you covered.

## 🚀 Features

- 🤖 **Hands-Free Shopping** – Engage with an interactive AI avatar for a truly immersive experience.
- 🤖 **AI-Powered Assistant** – Get instant help and guidance throughout your shopping journey.
- 🛒 **Real-Time Cart Management** – Track and manage your purchases effortlessly.
- 💬 **Natural Language Interaction** – Communicate seamlessly with AI using everyday language.
- 🎯 **Smart Product Recommendations** – Receive tailored suggestions based on your needs.
- 💳 **Dynamic Price Calculations** – Get real-time price updates and cost estimations.

DevKit.AI makes shopping smarter, faster, and more interactive than ever! 🚀✨

[Watch it in action on YouTube](https://youtu.be/Z_viC04X6Ko)

<iframe width="560" height="315" src="https://www.youtube.com/embed/Z_viC04X6Ko" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Getting Started

1. Rename `.env_sample` to `.env` and add your API keys:

```js
NEXT_PUBLIC_SIMLI_API_KEY=
NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
NEXT_PUBLIC_OPENAI_API_KEY=
```

Get your API keys from:

- [Simli API Key](https://www.simli.com/profile)
- [OpenAI API Key](https://platform.openai.com/settings/profile?tab=api-keys)

Need help with API access? Join our [Discord](https://discord.gg/yQx49zNF4d)

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Avatar Configuration

Frank, your AI shopping assistant, can be customized in `app/page.tsx`:

```js
const avatar = {
  name: "Frank",
  simli_faceid: "5514e24d-6086-46a3-ace4-6a7264e5cb7c",
  initialPrompt:
    "You are a helpful AI assistant named Frank. You are friendly and concise in your responses. Your task is to help users with any questions they might have. Your answers are short and to the point, don't give long answers be brief and straightforward.",
};
```

## Customization

- Browse more characters in the [Simli docs](https://docs.simli.com/introduction)
- [Create your own avatar](https://app.simli.com/)
