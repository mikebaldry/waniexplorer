import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import db, { SubjectType } from "./services/db";

import { Background, ReactFlow, Node, useNodesState, ReactFlowProvider, NodeChange, useReactFlow, NodeSelectionChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useGraphLayout from "./graphLayout";
import KanjiNode from "./KanjiNode";
import VocabularyNode from "./VocabularyNode";
import RadicalNode from "./RadicalNode";

const Graph = () => {
  const nodeTypes = useMemo(() => ({ radical: RadicalNode, kanji: KanjiNode, vocabulary: VocabularyNode }), []);
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  const fitNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    onNodesChange(changes);

    const notSelect = changes.some((nc) => nc.type !== "select")

    if (notSelect) {
      const kanji = nodes.find((n) => n.type === SubjectType.KANJI);
      requestAnimationFrame(() => {
        fitView({ nodes: [ { id: kanji!.id }]});
      })
      return;
    }

    const sel = changes.find((nc) => nc.type === "select" && nc.selected == true) as NodeSelectionChange | undefined;
    if (sel) {
      requestAnimationFrame(() => {
        fitView({ nodes: [ { id: sel.id }], duration: 500 });
      })
      return;
    }

  }, [fitView, nodes, onNodesChange]);

  useGraphLayout();

  let { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      const numId = parseInt(id as string);
      const [kanji, radicals, vocabularies] = await db.kanjiWithRelations(numId);

      const nodes: Node[] = [
        {
          id: kanji.id.toString(),
          position: { x: 0, y: 0 },
          style: { opacity: 0 },
          data: kanji, 
          type: "kanji"
        }
      ];

      radicals.forEach((radical) => {
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

      vocabularies.forEach((vocabulary) => {
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
    }

    fetchData();
  }, [id]);

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
    </ReactFlow>
  );
};

function KanjiView() {
  return (
    <ReactFlowProvider>
      <Graph />
    </ReactFlowProvider>
  )
}

export default KanjiView
