import { ConversationMessage } from './cartUtils';

interface TranscriptMetrics {
    [key: string]: any;
}

interface TranscriptMetadata {
    agent_id: string;
}

interface TranscriptPayload {
    transcript: ConversationMessage[];
    metrics: TranscriptMetrics;
    metadata: TranscriptMetadata;
}

const COVAL_API_ENDPOINT = 'https://api.coval.dev/eval/transcript';

export async function pushTranscriptToCoval(
    transcript: ConversationMessage[],
    metrics: TranscriptMetrics = {},
    agentId: string = 'default-agent'
): Promise<void> {
    const payload: TranscriptPayload = {
        transcript,
        metrics,
        metadata: {
            agent_id: agentId
        }
    };

    try {
        const apiKey = process.env.NEXT_PUBLIC_COVAL_API_KEY;
        if (!apiKey) {
            console.error('Coval API key not found in environment variables');
            return;
        }

        const response = await fetch(COVAL_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transcript: [{
                    role: 'user',
                    content: "hi there"
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully pushed transcript to Coval:', data);
    } catch (error) {
        console.error('Error pushing transcript to Coval:', error);
    }
}
