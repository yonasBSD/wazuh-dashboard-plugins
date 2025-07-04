/*
 * Wazuh app - React test for Table With Search Bar component.
 *
 * Copyright (C) 2015-2022 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 *
 */

import React from 'react';
import { mount } from 'enzyme';
import { TableWithSearchBar } from './table-with-search-bar';

// the jest.mock of @osd/monaco is added due to a problem transcribing the files to run the tests.
// https://github.com/wazuh/wazuh-dashboard-plugins/pull/6921#issuecomment-2298289550

jest.mock('@osd/monaco', () => ({
  monaco: {},
}));

jest.mock('../../../kibana-services', () => ({
  getHttp: () => ({
    basePath: {
      prepend: str => str,
    },
  }),
}));

jest.mock('../../../react-services/common-services', () => ({
  getErrorOrchestrator: () => ({
    handleError: options => {},
  }),
}));

jest.mock(
  '../../../../../../node_modules/@elastic/eui/lib/services/accessibility/html_id_generator',
  () => ({
    htmlIdGenerator: () => () => 'htmlId',
  }),
);

const columns = [
  {
    field: 'version',
    name: 'Version',
    sortable: true,
    truncateText: true,
  },
  {
    field: 'architecture',
    name: 'Architecture',
    sortable: true,
  },
  {
    field: 'cve',
    name: 'CVE',
    sortable: true,
    truncateText: true,
  },
  {
    field: 'name',
    name: 'Name',
    sortable: true,
  },
];

const searchBarWQLOptions = {
  searchTermFields: [],
};

const tableProps = {
  onSearch: () => {},
  tableColumns: columns,
  tablePageSizeOptions: [15, 25, 50, 100],
  tableInitialSortingDirection: 'asc',
  tableInitialSortingField: '',
  tableProps: {},
  reload: () => {},
  searchBarSuggestions: [],
  rowProps: () => {},
  searchBarWQL: {
    options: searchBarWQLOptions,
    suggestions: {
      field(currentValue) {
        return [];
      },
      value: async (currentValue, { field }) => {
        return [];
      },
    },
  },
};

beforeAll(() => {
  global.Date.now = jest.fn(() =>
    new Date('2024-12-02T14:35:10.123').getTime(),
  );
});

describe('Table With Search Bar component', () => {
  it('renders correctly to match the snapshot', () => {
    const wrapper = mount(<TableWithSearchBar {...tableProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
