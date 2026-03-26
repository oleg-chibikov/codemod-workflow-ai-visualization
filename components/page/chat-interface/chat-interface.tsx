'use client';

import { useEffect, useState } from 'react';
import { Workflow } from '@/components/types';
import { LangChainMessage } from '@/types/messages';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ChatPane } from './chat-pane';
import { MobileView, MobileToggle } from './mobile-toggle';
import { WorkflowPane } from './workflow-pane';

interface ChatInterfaceProps {
  /** Conversation history rendered inside the chat pane. */
  messages: LangChainMessage[];
  /** Whether the AI is currently generating a response. */
  isLoading: boolean;
  /** Called when the user submits a new message. */
  onSendMessage: (message: string) => void;
  /** The workflow to visualise, or `null` when none exists yet. */
  workflow: Workflow | null;
}

/**
 * Top-level chat interface composed of a two-pane layout:
 *
 * - **Left / Chat pane** — message history and input field.
 * - **Right / Workflow pane** — animated diagram that slides in after the AI
 *   finishes its typewriter animation.
 *
 * On mobile the two panes become tabs controlled by {@link MobileToggle}.
 *
 * ## Orchestration
 * 1. The AI sends a message that includes a workflow.
 * 2. `workflowReady` stays `false` until the last AI message finishes typing.
 * 3. Once typing is done the right pane springs into view.
 * 4. Once the spring animation settles `workflowPaneReady` flips to `true`,
 *    signalling to `ButterflowWorkflowVisualization` that it can call
 *    `fitView` safely (the pane now has its final dimensions).
 */
export const ChatInterface = ({
  messages,
  isLoading,
  onSendMessage,
  workflow,
}: ChatInterfaceProps) => {
  const [mobileView, setMobileView] = useState<MobileView>('chat');

  /**
   * Becomes `true` once the last AI message's typewriter animation completes.
   * Gates showing the workflow pane so the diagram doesn't pop in prematurely.
   */
  const [workflowReady, setWorkflowReady] = useState(false);

  /**
   * Becomes `true` once the workflow pane's spring entrance animation settles.
   * Passed to `ButterflowWorkflowVisualization` as `fitViewReady`.
   */
  const [workflowPaneReady, setWorkflowPaneReady] = useState(false);

  // When a fresh workflow arrives, reset both flags so the new typewriter
  // animation must complete before the diagram is shown again.
  useEffect(() => {
    if (workflow) {
      setWorkflowReady(false);
      setWorkflowPaneReady(false);
    }
  }, [workflow]);

  // When workflowReady flips on the pane slides in fresh, so reset pane-ready.
  useEffect(() => {
    if (workflowReady) setWorkflowPaneReady(false);
  }, [workflowReady]);

  /**
   * Narrowed discriminated-union props for `WorkflowPane`.
   *
   * TypeScript cannot infer that `workflow !== null` from a derived `boolean`,
   * so we build the union branch explicitly. When `workflowReady` is `true`
   * AND `workflow` is non-null, the `hasWorkflow: true` branch is selected and
   * `workflow` is typed as `Workflow` (never `null`). Otherwise the
   * `hasWorkflow: false` branch keeps `workflow` typed as `null`.
   */
  const workflowProps =
    workflowReady && workflow !== null
      ? ({ hasWorkflow: true,  workflow } as const)
      : ({ hasWorkflow: false, workflow: null } as const);

  return (
    <div className="h-[calc(100vh-70px)] w-full px-4 py-2 md:px-8">
      <MobileToggle
        activeView={mobileView}
        onViewChange={setMobileView}
        hasWorkflow={workflowProps.hasWorkflow}
      />

      <div className="relative flex h-[calc(100%-40px)] w-full md:h-full">
        <ChatPane
          messages={messages}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          hasWorkflow={workflowProps.hasWorkflow}
          mobileView={mobileView}
          onLastAiMessageTypingDone={() => setWorkflowReady(true)}
        />

        <WorkflowPane
          {...workflowProps}
          workflowPaneReady={workflowPaneReady}
          onAnimationComplete={() => setWorkflowPaneReady(true)}
          mobileView={mobileView}
        />
      </div>
    </div>
  );
};