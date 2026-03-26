interface LangChainMessageContent {
  type: 'text';
  text: string;
}

export interface LangChainMessage {
  id?: string;
  type: 'human' | 'ai' | 'system' | 'tool';
  content: string | LangChainMessageContent[];
  tool_call_id?: string;
  complete?: boolean;
}