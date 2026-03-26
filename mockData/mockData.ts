import { Workflow } from "@/components/types";
import { LangChainMessage } from "@/types/messages";
import { v4 as uuid } from 'uuid';


export const aiMessage: LangChainMessage = {
    id: uuid(),
    type: 'ai',
    content:
        "I've created a workflow based on your request. You can see it visualized on the right.",
};

export const mockWorkflow: Workflow = {
    version: '1.0',
    nodes: [
        {
            id: 'start',
            name: 'Start Node',
            type: 'automatic',
            steps: [],
        },
        {
            id: 'process',
            name: 'Process Data',
            type: 'automatic',
            depends_on: ['start'],
            steps: [],
        },
        {
            id: 'decision',
            name: 'Make Decision',
            type: 'manual',
            depends_on: ['process'],
            steps: [],
        },
        {
            id: 'success',
            name: 'Success Path',
            type: 'automatic',
            depends_on: ['decision'],
            steps: [],
        },
        {
            id: 'failure',
            name: 'Failure Path',
            type: 'automatic',
            depends_on: ['decision'],
            steps: [],
        },
        {
            id: 'end',
            name: 'End Node',
            type: 'automatic',
            depends_on: ['success', 'failure'],
            steps: [],
        },
    ],
};