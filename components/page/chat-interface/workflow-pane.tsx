'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Workflow } from '@/components/types';
import { ButterflowWorkflowVisualization } from '@/components/page/workflow-visualization';
import { MobileView } from './mobile-toggle';
import { useIsMobile } from '@/hooks/use-is-mobile';

/** Props shared regardless of whether a workflow is present. */
interface WorkflowPaneBaseProps {
    /**
     * When `true` the spring animation has settled and ReactFlow is safe to call
     * `fitView` because the pane has its final dimensions.
     */
    workflowPaneReady: boolean;
    /** Fired once the spring entrance animation has settled. */
    onAnimationComplete: () => void;
    /** Active mobile view — hides this pane when `'chat'` is selected. */
    mobileView: MobileView;
}

/**
 * Discriminated union on `hasWorkflow` so TypeScript can prove that
 * `workflow` is never `null` in the branch where `hasWorkflow` is `true`.
 *
 * @example
 * // ✅ TypeScript knows workflow is Workflow here
 * if (props.hasWorkflow) { consume(props.workflow); }
 *
 * // ✅ TypeScript knows workflow is null here
 * if (!props.hasWorkflow) { props.workflow; // null }
 */
type WorkflowPaneProps =
    | (WorkflowPaneBaseProps & { hasWorkflow: true; workflow: Workflow })
    | (WorkflowPaneBaseProps & { hasWorkflow: false; workflow: null });

/** Spring transition shared between layout animations. */
const SPRING = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    opacity: { duration: 0.2 },
} as const;

/**
 * Right pane of the two-pane layout that hosts the workflow diagram.
 *
 * The pane slides in from the right and fades in once `hasWorkflow` becomes
 * `true`. The inner diagram is additionally wrapped in an `AnimatePresence`
 * fade/scale transition to handle enter/exit smoothly.
 *
 * `onAnimationComplete` should flip `workflowPaneReady` to `true` in the
 * parent so that `ButterflowWorkflowVisualization` knows it can safely call
 * `fitView`.
 */
export const WorkflowPane = ({
    workflow,
    hasWorkflow,
    workflowPaneReady,
    onAnimationComplete,
    mobileView,
}: WorkflowPaneProps) => {
    /**
     * On mobile the tab toggle handles visibility via CSS (`hidden`/`flex`),
     * so width and opacity must be `100%`/`1` — framer-motion must not shrink
     * or hide the pane or the diagram will never be visible when the tab is
     * switched to "Workflow".
     */
    const isMobile = useIsMobile();

    return (
        <motion.div
            className={cn(
                'flex h-full overflow-hidden',
                mobileView === 'chat'
                    ? 'hidden md:flex'
                    : 'flex w-full md:w-auto'
            )}
            animate={{
                width: isMobile ? '100%' : hasWorkflow ? '60%' : '0%',
                opacity: isMobile ? 1 : hasWorkflow ? 1 : 0,
                x: isMobile ? '0%' : hasWorkflow ? '0%' : '5%',
            }}
            initial={{ width: '0%', opacity: 0, x: '5%' }}
            transition={SPRING}
            style={{ pointerEvents: hasWorkflow ? 'auto' : 'none' }}
            onAnimationComplete={() => {
                if (hasWorkflow) onAnimationComplete();
            }}
        >
            <Card className="flex h-full w-full flex-col overflow-hidden">
                <CardHeader className="pb-0">
                    <CardTitle>Workflow Diagram</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 pt-2">
                    <AnimatePresence>
                        {hasWorkflow && (
                            <motion.div
                                className="h-full w-full"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                <ButterflowWorkflowVisualization
                                    workflow={{ workflow }}
                                    tasks={[]}
                                    fitViewReady={workflowPaneReady}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
};