import { useCallback, useEffect, useMemo } from "react";
import { View } from "../../db/db";

import { Background, ReactFlow, Node, useNodesState, NodeChange, useReactFlow, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useGraphLayout from "./graphLayout";
import KanjiNode from "./nodes/KanjiNode";
import VocabularyNode from "./nodes/VocabularyNode";
import RadicalNode from "./nodes/RadicalNode";
import { useKeyboardEvent } from "@react-hookz/web";

// this needs to take order (to specify which type is at which layer) and also which id is primary (zoom in to on reset)

export enum StandardViewOrdering {
  RADICAL_KANJI_VOCABULARY,
  VOCABULARY_KANJI_RADICAL
}

export type StandardViewProps = {
  view: View,
  primarySubjectId: number,
  ordering: StandardViewOrdering
}

const StandardView = ({ view, primarySubjectId, ordering }: StandardViewProps) => {
  const nodeTypes = useMemo(() => ({ radical: RadicalNode, kanji: KanjiNode, vocabulary: VocabularyNode }), []);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  const handleResetView = useCallback(() => {
    fitView({ nodes: [ { id: primarySubjectId.toString() }], duration: 500 });
  }, [fitView, primarySubjectId]);

  const fitNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    onNodesChange(changes);

    const notSelect = changes.some((nc) => nc.type !== "select")

    if (notSelect) {
      requestAnimationFrame(() => {
        fitView({ nodes: [ { id: primarySubjectId.toString() }]});
      })
      return;
    }
  }, [fitView, nodes, onNodesChange]);

  useGraphLayout({ ordering });

  useKeyboardEvent("0", handleResetView);
  useKeyboardEvent("+", () => zoomIn());
  useKeyboardEvent("=", () => zoomIn());
  useKeyboardEvent("-", () => zoomOut());
  useKeyboardEvent("_", () => zoomOut());

  useEffect(() => {
    const nodes: Node[] = [];

    view.kanjis.forEach((kanji) => {
      nodes.push(
        {
          id: kanji.id.toString(),
          position: { x: 0, y: 0 },
          style: { opacity: 0 },
          data: kanji, 
          type: "kanji"
        }
      )
    });

    view.radicals.forEach((radical) => {
      nodes.push(
        {
          id: radical.id.toString(),
          position: { x: 0, y: 0 },
          style: { opacity: 0 },
          data: radical, 
          type: "radical"
        }
      )
    });

    view.vocabularies.forEach((vocabulary) => {
      nodes.push(
        {
          id: vocabulary.id.toString(),
          position: { x: 0, y: 0 },
          style: { opacity: 0 },
          data: vocabulary, 
          type: "vocabulary"
        }
      )
    });

    setNodes(nodes);
  }, [view]);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={fitNodesChange}
      nodeTypes={nodeTypes}

      colorMode="dark" 
      
      fitViewOptions={{ padding: 0.5 }}

      proOptions={{ hideAttribution: true }}

      nodesDraggable={false}
    >
      <Background />
      <Controls showInteractive={false} fitViewOptions={ { nodes: [ { id: primarySubjectId.toString() }], duration: 500 } } />
    </ReactFlow>
  );
};

export default StandardView
