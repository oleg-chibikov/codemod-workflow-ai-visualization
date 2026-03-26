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
    <button
      onClick={() => onViewChange('chat')}
      className={[
        'flex-1 rounded-none px-4 py-2 text-sm font-medium',
        'transition-all duration-300 ease-in-out',
        'border border-input',
        activeView === 'chat'
          ? 'bg-primary text-primary-foreground shadow-inner'
          : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      ].join(' ')}
    >
      Chat
    </button>
    <button
      onClick={() => hasWorkflow && onViewChange('workflow')}
      disabled={!hasWorkflow}
      className={[
        'flex-1 rounded-none px-4 py-2 text-sm font-medium',
        'transition-all duration-300 ease-in-out',
        'border border-l-0 border-input',
        'inline-flex items-center justify-center gap-2',
        activeView === 'workflow'
          ? 'bg-primary text-primary-foreground shadow-inner'
          : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        !hasWorkflow && 'cursor-not-allowed opacity-50',
      ].join(' ')}
    >
      Workflow
      {hasWorkflow && (
        <Badge
          className={[
            'transition-colors duration-300',
            activeView === 'workflow'
              ? 'bg-primary-foreground text-primary'
              : 'bg-primary text-primary-foreground',
          ].join(' ')}
        >
          1
        </Badge>
      )}
    </button>
  </div>
);