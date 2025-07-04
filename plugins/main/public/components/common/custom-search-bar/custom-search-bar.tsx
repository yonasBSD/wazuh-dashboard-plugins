import React, { useState, useEffect, HTMLAttributes } from 'react';
import {
  Filter,
  IndexPattern,
} from '../../../../../../src/plugins/data/public/';
import {
  FilterMeta,
  FilterState,
  FilterStateStore,
} from '../../../../../../src/plugins/data/common';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSwitch,
  EuiFlexItemProps,
  EuiPopover,
  EuiButtonEmpty,
  CommonProps,
} from '@elastic/eui';
import { tFilter } from '../data-source';
//@ts-ignore
import { MultiSelect } from './components';
import { getCustomValueSuggestion } from '../../../components/overview/office/panel/config/helpers/helper-value-suggestion';
import { I18nProvider } from '@osd/i18n/react';
import { tUseSearchBarProps } from '../search-bar/use-search-bar';
import { WzSearchBar } from '../search-bar/search-bar';
import { MultiSelectInput } from './components/multi-select-input';

interface FilterInput {
  type: string;
  key: string;
  placeholder: string;
  filterByKey?: boolean;
  options?: string[];
}

export type CustomSearchBarProps = {
  filterInputs: FilterInput[];
  filterDrillDownValue?: { field: string; value: string };
  searchBarProps: tUseSearchBarProps;
  indexPattern: IndexPattern;
  fixedFilters: Filter[];
  setFilters: (filters: tFilter[]) => void;
  filterInputsProps: CommonProps &
    EuiFlexItemProps & {
      style: HTMLAttributes<HTMLDivElement | HTMLSpanElement>['style'];
    };
};

const frozenFilterDrillDownValue = Object.freeze({ field: '', value: '' });

export const CustomSearchBar = ({
  filterInputs,
  /* Using a frozen value when this prop is not
  provided, it avoids the MultiSelect component fetches again when this component is rendered due
  to the filterDrillDownValue passed to that component was creating a new reference in each render
  and it is used as effect dependency to fetch the suggestions */
  filterDrillDownValue = frozenFilterDrillDownValue,
  searchBarProps,
  indexPattern,
  setFilters,
  fixedFilters,
  filterInputsProps,
}: CustomSearchBarProps) => {
  const { filters } = searchBarProps;

  const defaultSelectedOptions = () => {
    const array: string[][] = [];
    filterInputs.forEach(item => {
      array[item.key] = [];
    });

    return array;
  };
  const [avancedFiltersState, setAvancedFiltersState] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[][]>(
    defaultSelectedOptions(),
  );
  const [values, setValues] = useState<any[]>([]);
  const [selectReference, setSelectReference] = useState<string>('');

  useEffect(() => {
    setPluginPlatformFilters(values, selectReference);
    refreshCustomSelectedFilter();
  }, [values, selectReference]);

  useEffect(() => {
    refreshCustomSelectedFilter();
  }, [filters, fixedFilters]);

  const checkSelectDrillDownValue = (key: string) => {
    return filterDrillDownValue.field === key &&
      filterDrillDownValue.value != ''
      ? true
      : false;
  };

  const onFiltersUpdated = (filters?: Filter[]) => {
    setFilters([filters]);
  };

  const changeSwitch = () => {
    setAvancedFiltersState(state => !state);
  };

  const buildCustomFilter = (values?: FilterInput[]): Filter => {
    const newFilters = values?.map(element => ({
      match_phrase: {
        [element.value]: {
          query: element.filterByKey ? element.key : element.label,
        },
      },
    }));
    const params = values.map(item =>
      item.filterByKey ? item.key.toString() : item.label,
    );
    const meta: FilterMeta = {
      disabled: false,
      negate: false,
      key: values[0].value,
      params: params,
      alias: null,
      type: 'phrases',
      value: params.join(','),
      index: indexPattern.id,
    };
    const $state: FilterState = {
      store: FilterStateStore.APP_STATE,
    };
    const query = {
      bool: {
        minimum_should_match: 1,
        should: newFilters,
      },
    };

    return { meta, $state, query };
  };

  const setPluginPlatformFilters = (values: any[], selectReference: String) => {
    let customFilter = [];
    const currentFilters = filters.filter(
      item => item.meta.key != selectReference,
    );
    if (values.length != 0) {
      customFilter = [buildCustomFilter(values)];
    }
    setFilters([...currentFilters, ...customFilter]);
  };

  const refreshCustomSelectedFilter = () => {
    setSelectedOptions(defaultSelectedOptions());
    // The dropdown filters could be added like fixed filters and user filters
    const currentFilters =
      [...filters, ...fixedFilters]
        .filter(
          item =>
            item.meta.type === 'phrases' &&
            Object.keys(selectedOptions).includes(item.meta.key),
        )
        .map(element => ({
          params: element.meta.params,
          key: element.meta.key,
        })) || [];

    const getFilterCustom = item => {
      // ToDo: Make this generic, without office 365 hardcode
      return item.params.map(element => ({
        checked: 'on',
        label:
          item.key === 'data.office365.UserType'
            ? getLabelUserType(element)
            : element,
        value: item.key,
        key: element,
        filterByKey: item.key === 'data.office365.UserType' ? true : false,
      }));
    };
    const getLabelUserType = element => {
      const userTypeOptions = getCustomValueSuggestion(
        'data.office365.UserType',
      );
      return userTypeOptions.find(
        (item, index) => index.toString() === element,
      );
    };
    const filterCustom =
      currentFilters.map(item => getFilterCustom(item)) || [];
    if (filterCustom.length != 0) {
      filterCustom.forEach(item => {
        item.forEach(element => {
          setSelectedOptions(prevState => ({
            ...prevState,
            [element.value]: [...prevState[element.value], element],
          }));
        });
      });
    }
  };

  const onChange = (values: any[], id: string) => {
    setSelectReference(id);
    setValues(values);
  };

  const onRemove = filter => {
    const currentFilters = filters.filter(item => item.meta.key != filter);
    setFilters(currentFilters);
    refreshCustomSelectedFilter();
  };

  const getComponent = (item: any) => {
    const types: { [key: string]: object } = {
      default: <></>,
      multiSelect: (
        <MultiSelect
          item={item}
          selectedOptions={selectedOptions[item.key] || []}
          onChange={onChange}
          onRemove={onRemove}
          isDisabled={checkSelectDrillDownValue(item.key)}
          filterDrillDownValue={filterDrillDownValue}
          indexPattern={indexPattern}
        />
      ),
      multiSelectInput: (
        <MultiSelectInput
          item={item}
          selectedOptions={selectedOptions[item.key] || []}
          onChange={onChange}
          onRemove={onRemove}
          isDisabled={checkSelectDrillDownValue(item.key)}
          filterDrillDownValue={filterDrillDownValue}
          indexPattern={indexPattern}
        />
      ),
    };
    return types[item.type] || types.default;
  };

  return (
    <I18nProvider>
      <div>
        <WzSearchBar
          {...searchBarProps}
          fixedFilters={fixedFilters}
          showQueryInput={avancedFiltersState}
          onFiltersUpdated={onFiltersUpdated}
          preQueryBar={
            !avancedFiltersState ? (
              <EuiFlexGroup
                className='custom-kbn-search-bar'
                alignItems='center'
                gutterSize='s'
              >
                {filterInputs.map((item, key) => (
                  <EuiFlexItem key={key} {...filterInputsProps}>
                    {getComponent(item)}
                  </EuiFlexItem>
                ))}
              </EuiFlexGroup>
            ) : null
          }
          postFilters={
            <>
              <div
                style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
              >
                {!avancedFiltersState && searchBarProps?.query?.query && (
                  <QueryPopover query={searchBarProps.query.query} />
                )}
                <div>
                  <EuiSwitch
                    label='Advanced filters'
                    checked={avancedFiltersState}
                    onChange={() => changeSwitch()}
                  />
                </div>
              </div>
            </>
          }
        />
      </div>
    </I18nProvider>
  );
};

const QueryPopover = ({ query }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <EuiPopover
      button={
        <EuiButtonEmpty
          iconType='wsSearch'
          iconSide='right'
          size='s'
          isDisabled={!query}
          onClick={() => setIsOpen(state => !state)}
        >
          Query
        </EuiButtonEmpty>
      }
      isOpen={isOpen}
      closePopover={() => setIsOpen(false)}
    >
      {query}
    </EuiPopover>
  );
};
