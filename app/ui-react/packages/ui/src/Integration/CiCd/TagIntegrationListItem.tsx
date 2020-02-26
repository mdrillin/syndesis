import { DataListCell, DataListCheck, DataListItem, DataListItemCells, DataListItemRow } from 'patternfly-react';
import * as React from 'react';
import { toValidHtmlId } from '../../helpers';
import './TagIntegrationListItem.css';

export interface ITagIntegrationListItemProps {
  selected: boolean;
  name: string;
  onChange: (name: string, selected: boolean) => void;
}

export const TagIntegrationListItem: React.FC<ITagIntegrationListItemProps> = ({
  selected,
  name,
  onChange,
}) => {

  return (
    <DataListItem
      aria-labelledby={'tag integration list item'}
      data-testid={`tag-integration-list-item-${toValidHtmlId(
        name
      )}-selected-input`}
      className={'tag-integration-list-item'}
    >
      <DataListItemRow>
        <DataListCheck
          aria-labelledby="tag-integration-list-item-check"
          name="tag-integration-list-item-check"
          checked={selected}
          // tslint:disable-next-line: jsx-no-lambda
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(name, event.target.checked)}
        />
        <DataListItemCells
          dataListCells={[
            <DataListCell key={'primary content'} width={2}>
              <div className={'tag-integration-list-item__text-wrapper'}>
                <b>{name}</b>
              </div>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
    </DataListItem>
  );
};
