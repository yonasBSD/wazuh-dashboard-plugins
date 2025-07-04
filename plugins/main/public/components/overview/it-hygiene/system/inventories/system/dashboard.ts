import { buildDashboardKPIPanels } from '../../../common/create-dashboard-panels-kpis';
import { STYLE } from '../../../common/saved-vis/constants';
import {
  createIndexPatternReferences,
  createSearchSource,
} from '../../../common/saved-vis/create-saved-vis-data';
import { getVisStateHorizontalBarByField } from '../../../common/saved-vis/generators';
import { SavedVis } from '../../../common/types';
import { getVisStateHorizontalBarSplitSeries } from '../../../../../../services/visualizations/index';

type HostArchitecture = 'x86_64' | 'arm64';

const getVisStateHostArchitectureMetric = (
  indexPatternId: string,
  arch: string,
): SavedVis => {
  return {
    id: `it-hygiene-host-architecture-${arch}`,
    title: `Host architecture ${arch}`,
    type: 'metric',
    params: {
      addTooltip: true,
      addLegend: false,
      type: 'metric',
      metric: {
        percentageMode: false,
        useRanges: false,
        colorSchema: 'Green to Red',
        metricColorMode: 'None',
        colorsRange: [
          {
            from: 0,
            to: 10000,
          },
        ],
        labels: {
          show: true,
        },
        invertColors: false,
        style: STYLE,
      },
    },
    data: {
      searchSource: createSearchSource(indexPatternId),
      references: createIndexPatternReferences(indexPatternId),
      aggs: [
        {
          id: '1',
          enabled: true,
          type: 'count',
          params: {
            customLabel: arch.toLocaleUpperCase(),
          },
          schema: 'metric',
        },
        {
          id: '2',
          enabled: true,
          type: 'filters',
          params: {
            filters: [
              {
                input: {
                  query: `host.architecture: ${arch}`,
                  language: 'kuery',
                },
                label: 'Host Architecture',
              },
            ],
          },
          schema: 'group',
        },
      ],
    },
  };
};

export const getOverviewSystemSystemTab = (indexPatternId: string) => {
  return buildDashboardKPIPanels([
    getVisStateHorizontalBarByField(
      indexPatternId,
      'host.os.platform',
      'Top 5 platforms',
      'it-hygiene-system',
      { customLabel: 'Platforms' },
    ),
    getVisStateHorizontalBarByField(
      indexPatternId,
      'host.os.name',
      'Top 5 operating systems',
      'it-hygiene-system',
      { customLabel: 'OS' },
    ),
    getVisStateHorizontalBarSplitSeries(
      indexPatternId,
      'host.architecture',
      'Architecture',
      'it-hygiene-system',
      {
        fieldSize: 4,
        otherBucket: 'Others',
        metricCustomLabel: 'Host architecture count',
        valueAxesTitleText: ' ',
        fieldCustomLabel: 'Host architecture',
        seriesLabel: 'Host architecture',
      },
    ),
  ]);
};
