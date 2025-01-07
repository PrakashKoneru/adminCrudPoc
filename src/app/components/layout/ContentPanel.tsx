/* eslint-disable */
// @ts-nocheck
import { ContentPanel as ContentPanelType } from '../../../types/components/layout';
import { Box, Grid } from '@chakra-ui/react';
import { Card } from '../card';
import { Button } from '../button';

interface ContentPanelProps {
  properties: {
    layout: {
      display: 'grid'
      columns: number
      rows: number
      width: number
    }
  }
  children: Array<{
    id: string
    type: string
    variant: string
    width: number
    height: number
    grid: {
      colStart: number
      colSpan: number
      rowStart: number
    }
    properties: {
      text: string
      action: {
        type: string
        variant: string
        deep_link?: string
        onClick?: string
      }
    }
  }>
}

export const ContentPanel = ({ properties, children }: ContentPanelProps) => {
  const { layout } = properties;
  const columnWidth = layout.width / layout.columns;
  const rowHeight = 475 / layout.rows;

  return (
    <Grid
      w={layout.width}
      h={475}
      templateColumns={`repeat(${layout.columns}, ${columnWidth}px)`}
      templateRows={`repeat(${layout.rows}, ${rowHeight}px)`}
    >
      {children.map((child) => {
        const gridArea = `${child.grid.rowStart} / ${child.grid.colStart} / auto / span ${child.grid.colSpan}`;

        switch (child.type) {
          case 'Card':
            return (
              <Card 
                key={child.id}
                gridArea={gridArea}
                {...child}
              />
            );
          case 'Button':
            return (
              <Button 
                key={child.id}
                gridArea={gridArea}
                {...child}
              />
            );
          default:
            return null;
        }
      })}
    </Grid>
  );
};
