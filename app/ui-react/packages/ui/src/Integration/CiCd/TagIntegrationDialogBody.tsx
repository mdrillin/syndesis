import * as H from '@syndesis/history';
import * as React from 'react';
import { CiCdList } from './CiCdList';
import { ITagIntegrationEntry } from './CiCdUIModels';
import { TagIntegrationDialogEmptyState } from './TagIntegrationDialogEmptyState';
import { TagIntegrationListItem } from './TagIntegrationListItem';

export interface ITagIntegrationDialogBodyProps {
  manageCiCdHref: H.LocationDescriptor;
  initialItems: ITagIntegrationEntry[];
  onChange: (
    items: ITagIntegrationEntry[],
    initialItems: ITagIntegrationEntry[]
  ) => void;
  i18nEmptyStateTitle: string;
  i18nEmptyStateInfo: string;
  i18nEmptyStateButtonText: string;
}

export const TagIntegrationDialogBody: React.FunctionComponent<ITagIntegrationDialogBodyProps> = props => {
  const [items, setItems] = React.useState(props.initialItems);

  const handleChange = (name: string, selected: boolean) => {
    const newItems = items.map(item =>
      item.name === name ? { name, selected } : item
    );
    setItems(newItems);
    props.onChange(items, props.initialItems);
  };

  return (
    <>
      {items.length > 0 && (
        <>
          <CiCdList>
            {items.map((item, index) => (
              <TagIntegrationListItem
                key={index}
                name={item.name}
                selected={item.selected}
                onChange={handleChange}
              />
            ))}
          </CiCdList>
        </>
      )}
      {items.length === 0 && (
        <TagIntegrationDialogEmptyState
          href={props.manageCiCdHref}
          i18nTitle={props.i18nEmptyStateTitle}
          i18nInfo={props.i18nEmptyStateInfo}
          i18nGoToManageCiCdButtonText={props.i18nEmptyStateButtonText}
        />
      )}
    </>
  );
};
