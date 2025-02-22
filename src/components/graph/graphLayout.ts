import { useReactFlow, useNodesInitialized, Node } from '@xyflow/react';
import { useEffect } from 'react';
import chunk from 'lodash-es/chunk';

const applyLayout = (nodes: Node[]) => {
  const maxNodesPerRow = 6;
  const paddingBetweenGroups = 30;
  const paddingBetweenRows = 20;
  const paddingBetweenNodesX = 20;
  
  const groups = [
    chunk(nodes.filter(n => n.type == 'radical'), maxNodesPerRow),
    chunk(nodes.filter(n => n.type == 'kanji'), maxNodesPerRow),
    chunk(nodes.filter(n => n.type == 'vocabulary'), maxNodesPerRow)
  ]


  let maxRowWidth = 0;
  let rowWidths: number[] = [];
  let y = 0;
  let x = 0;
  
  for (const rows of groups) {
    for (const nodes of rows) {
      let maxNodeHeight = 0;

      x = 0;

      for (const node of nodes) {
        node.position.x = x;
        node.position.y = y;

        if (!node.measured || !node.measured.width || !node.measured.height) {
          throw "node isn't measured yet, so this is called at wrong point...";
        } else {
          x += node.measured.width + paddingBetweenNodesX;
          maxNodeHeight = Math.max(maxNodeHeight, node.measured.height);
        }
      }

      x -= paddingBetweenNodesX;

      maxRowWidth = Math.max(maxRowWidth ?? 0, x)
      rowWidths.push(x)
      y += maxNodeHeight;
      y += paddingBetweenRows;
    }
    y -= paddingBetweenRows;

    y += paddingBetweenGroups;
  }

  for (const rows of groups) {
    for (const nodes of rows) {
      const width = rowWidths.shift();
      const centerPoint = (maxRowWidth / 2) - (width! / 2);

      for (const node of nodes) {
        node.position.x += centerPoint;
        node.style!.opacity = 1;
      }
    }
  }

  return nodes;
}

export default function useGraphLayout() {
  const nodesInitialized = useNodesInitialized();
  const { getNodes, setNodes, fitView } = useReactFlow();
 
  useEffect(() => {
    if (nodesInitialized) {
      const layoutedNodes = applyLayout(
        getNodes(),
      );

      setNodes(layoutedNodes);
    }
  }, [nodesInitialized, getNodes, setNodes, fitView]);
 
  return null;
}