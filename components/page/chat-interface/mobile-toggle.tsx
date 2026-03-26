'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/** The two views available on mobile. */
export type MobileView = 'chat' | 'workflow';

interface MobileToggleProps {
  /** Currently active view. */
  activeView: MobileView;
  /** Called when the user switches tabs. */
  onViewChange: (view: MobileView) => void;
  /** Whether the workflow tab should be enabled. */
  hasWorkflow: boolean;
}

/**
 * Tab bar shown only on mobile (`md:hidden`) that lets the user switch
 * between the Chat pane and the Workflow diagram pane.
 *
 * The Workflow tab is disabled until a workflow has been generated, and
 * renders a numeric badge once one is available.
 */
export const MobileToggle = ({
  activeView,
  onViewChange,
  hasWorkflow,
}: MobileToggleProps) => (
  <div className="mb-2 flex md:hidden">
    <Button
      variant={activeView === 'chat' ? 'default' : 'outline'}
      onClick={() => onViewChange('chat')}
      className="flex-1 rounded-none"
    >
      Chat
    </Button>
    <Button
      variant={activeView === 'workflow' ? 'default' : 'outline'}
      onClick={() => onViewChange('workflow')}
      className="flex-1 rounded-none"
      disabled={!hasWorkflow}
    >
      Workflow
      {hasWorkflow && <Badge className="ml-2">1</Badge>}
    </Button>
  </div>
);