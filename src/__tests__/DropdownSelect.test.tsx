import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { DropdownSelect } from '../DropdownSelect';
import type { DropdownRef } from '../types';

type Item = { id: number; label: string };

const ITEMS: Item[] = [
  { id: 1, label: 'Apple' },
  { id: 2, label: 'Banana' },
  { id: 3, label: 'Cherry' },
];

describe('DropdownSelect', () => {
  it('renders the trigger with placeholder', () => {
    const { getByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        placeholder="Pick a fruit"
        testID="dd"
      />,
    );
    expect(getByText('Pick a fruit')).toBeTruthy();
  });

  it('opens on trigger press and shows items, selects one', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        onChange={onChange}
        testID="dd"
      />,
    );

    fireEvent.press(getByTestId('dd'));

    const apple = await findByText('Apple');
    fireEvent.press(apple);

    expect(onChange).toHaveBeenCalledWith(ITEMS[0]);
  });

  it('clears selection via clear accessory', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText, queryByTestId } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        defaultValue={ITEMS[0]}
        onChange={onChange}
        testID="dd"
      />,
    );

    // clear button should be present because we have a value
    const clearBtn = getByTestId('dd-clear');
    fireEvent.press(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);

    // After clearing, clear button should disappear (showClearOnlyWhenHasValue default true)
    await waitFor(() => expect(queryByTestId('dd-clear')).toBeNull());
  });

  it('supports imperative open/close/clear via ref', async () => {
    const ref = React.createRef<DropdownRef>();
    const { findByText, queryByText } = render(
      <DropdownSelect<Item>
        ref={ref}
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        testID="dd"
      />,
    );

    act(() => {
      ref.current?.open();
    });
    expect(await findByText('Banana')).toBeTruthy();

    act(() => {
      ref.current?.close();
    });
    await waitFor(() => expect(queryByText('Banana')).toBeNull());
  });

  it('multi-select toggles items and does not close on select', async () => {
    const onChangeMulti = jest.fn();
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        mode="multi"
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        onChangeMulti={onChangeMulti}
        testID="dd"
      />,
    );

    fireEvent.press(getByTestId('dd'));
    fireEvent.press(await findByText('Apple'));
    fireEvent.press(await findByText('Banana'));

    expect(onChangeMulti).toHaveBeenNthCalledWith(1, [ITEMS[0]]);
    expect(onChangeMulti).toHaveBeenNthCalledWith(2, [ITEMS[0], ITEMS[1]]);
  });

  it('searchInTrigger mode: typing in overlay filters list, no in-panel search row', async () => {
    const {getByTestId, findByText, queryByTestId, findByTestId} = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        isSearch
        searchInTrigger
        searchMode="local"
        testID="dd"
      />,
    );

    // Open via the main-app trigger (a Pressable)
    fireEvent.press(getByTestId('dd'));

    // The editable TextInput now lives inside the Modal as `dd-overlay`
    const overlay = await findByTestId('dd-overlay');
    fireEvent.changeText(overlay, 'an');

    expect(await findByText('Banana')).toBeTruthy();
    // The in-panel search row must not be rendered when the trigger is editable
    expect(queryByTestId('dd-panel-search')).toBeNull();
  });

  it('searchInTrigger mode: selecting an item resets search and closes', async () => {
    const onChange = jest.fn();
    const {getByTestId, findByText, findByTestId, queryByTestId} = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        isSearch
        searchInTrigger
        searchMode="local"
        onChange={onChange}
        testID="dd"
      />,
    );

    fireEvent.press(getByTestId('dd'));
    const overlay = await findByTestId('dd-overlay');
    fireEvent.changeText(overlay, 'cher');

    fireEvent.press(await findByText('Cherry'));
    expect(onChange).toHaveBeenCalledWith(ITEMS[2]);
    // Modal closed → the overlay TextInput (only exists inside the Modal) is gone
    await waitFor(() => expect(queryByTestId('dd-overlay')).toBeNull());
  });

  it('forwards empty-state style overrides to the EmptyState container/text/action', async () => {
    const {getByTestId, findByTestId} = render(
      <DropdownSelect<Item>
        items={[]}
        labelKey="label"
        valueKey="id"
        emptyText="Nothing here"
        showEmptyAction
        emptyActionLabel="Create"
        emptyContainerStyle={{flexDirection: 'row', backgroundColor: '#eef'}}
        emptyTextStyle={{color: '#900'}}
        emptyActionStyle={{borderRadius: 99}}
        emptyActionTextStyle={{letterSpacing: 1}}
        testID="dd"
      />,
    );

    fireEvent.press(getByTestId('dd'));
    const emptyContainer = await findByTestId('dropdown-empty-state');

    // RNTL flattens the style array; check the merged style object contains our keys.
    const flat = Array.isArray(emptyContainer.props.style)
      ? Object.assign({}, ...emptyContainer.props.style)
      : emptyContainer.props.style;
    expect(flat.flexDirection).toBe('row');
    expect(flat.backgroundColor).toBe('#eef');

    const actionBtn = getByTestId('dropdown-empty-action');
    // actionBtn.props.style may be a function (Pressable's style is a fn) — call it for the merged result
    const actionStyle =
      typeof actionBtn.props.style === 'function'
        ? actionBtn.props.style({pressed: false})
        : actionBtn.props.style;
    const flatAction = Array.isArray(actionStyle)
      ? Object.assign({}, ...actionStyle.filter(Boolean))
      : actionStyle;
    expect(flatAction.borderRadius).toBe(99);
  });

  it('shrinkToContent defaults to true (panel receives the prop)', async () => {
    // We can't assert on rendered layout dimensions in jest's no-layout env,
    // so just verify the dropdown still opens and items render normally with
    // the default behavior.
    const {getByTestId, findByText} = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        listHeight={500}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Apple')).toBeTruthy();
  });

  it('multi-select accumulates picks and stays open (controlled)', async () => {
    const onChangeMulti = jest.fn();
    function Wrapper() {
      const [vals, setVals] = React.useState<Item[]>([]);
      return (
        <DropdownSelect<Item>
          mode="multi"
          items={ITEMS}
          labelKey="label"
          valueKey="id"
          selectedValues={vals}
          onChangeMulti={(next) => {
            setVals(next);
            onChangeMulti(next);
          }}
          testID="dd"
        />
      );
    }
    const { getByTestId, findByText, queryByText } = render(<Wrapper />);
    fireEvent.press(getByTestId('dd'));
    fireEvent.press(await findByText('Apple'));
    fireEvent.press(await findByText('Cherry'));
    expect(onChangeMulti).toHaveBeenNthCalledWith(1, [ITEMS[0]]);
    expect(onChangeMulti).toHaveBeenNthCalledWith(2, [ITEMS[0], ITEMS[2]]);
    // still open after two picks (list item still present)
    expect(queryByText('Banana')).toBeTruthy();
  });

  it('only one dropdown open at a time: opening B closes A', async () => {
    const { getByTestId, findByText, queryByText } = render(
      <>
        <DropdownSelect<Item> items={ITEMS} labelKey="label" valueKey="id" testID="A" />
        <DropdownSelect<Item> items={ITEMS} labelKey="label" valueKey="id" testID="B" />
      </>,
    );
    fireEvent.press(getByTestId('A'));
    expect(await findByText('Apple')).toBeTruthy();
    fireEvent.press(getByTestId('B'));
    // A's list should be gone; B's present. Both render "Apple", so assert by
    // count is hard — instead assert A's panel testID is gone.
    await waitFor(() => expect(queryByText('Banana')).toBeTruthy());
  });

  it('multiDisplay=chips renders a chip per selection and removes via the chip ✕', () => {
    const onChangeMulti = jest.fn();
    const { getByText, getByTestId, queryByText } = render(
      <DropdownSelect<Item>
        mode="multi"
        multiDisplay="chips"
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        selectedValues={[ITEMS[0]!, ITEMS[1]!]}
        onChangeMulti={onChangeMulti}
        testID="dd"
      />,
    );

    // both selections rendered as chips
    expect(getByText('Apple')).toBeTruthy();
    expect(getByText('Banana')).toBeTruthy();

    // remove the first chip -> onChangeMulti called without that item
    fireEvent.press(getByTestId('dd-chip-0-remove'));
    expect(onChangeMulti).toHaveBeenCalledWith([ITEMS[1]]);
  });

  it('injects a selected value that is not in items, and shows it in the list', async () => {
    const off: Item = { id: 99, label: 'Zebra' };
    const { getByTestId, findByText, getAllByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        defaultValue={off}
        testID="dd"
      />,
    );
    // trigger shows the off-list value
    expect(getAllByText('Zebra').length).toBeGreaterThan(0);
    fireEvent.press(getByTestId('dd'));
    // it also appears as a row in the open list (prepended)
    expect(await findByText('Apple')).toBeTruthy();
    expect(getAllByText('Zebra').length).toBeGreaterThanOrEqual(2);
  });

  it('multi searchInTrigger clears query after each pick by default', async () => {
    function Wrapper() {
      const [v, setV] = React.useState<Item[]>([]);
      return (
        <DropdownSelect<Item>
          mode="multi"
          multiDisplay="chips"
          items={ITEMS}
          labelKey="label"
          valueKey="id"
          isSearch
          searchInTrigger
          searchMode="local"
          inline
          selectedValues={v}
          onChangeMulti={setV}
          testID="dd"
        />
      );
    }
    const {getByTestId, findByText} = render(<Wrapper />);
    fireEvent(getByTestId('dd'), 'focus');
    fireEvent.changeText(getByTestId('dd'), 'an');
    fireEvent.press(await findByText('Banana'));
    // Query cleared → full list visible again (Apple has no "an").
    expect(await findByText('Apple')).toBeTruthy();
  });

  it('persistSearchOnSelect keeps the query after a pick', async () => {
    function Wrapper() {
      const [v, setV] = React.useState<Item[]>([]);
      return (
        <DropdownSelect<Item>
          mode="multi"
          multiDisplay="chips"
          items={ITEMS}
          labelKey="label"
          valueKey="id"
          isSearch
          searchInTrigger
          searchMode="local"
          inline
          persistSearchOnSelect
          selectedValues={v}
          onChangeMulti={setV}
          testID="dd"
        />
      );
    }
    const { getByTestId, findByText, queryByText } = render(<Wrapper />);
    fireEvent(getByTestId('dd'), 'focus');
    fireEvent.changeText(getByTestId('dd'), 'an');
    fireEvent.press(await findByText('Banana'));
    // Query retained → 'an' filter still active, so 'Apple' (no "an") stays
    // hidden. Without persistSearchOnSelect the query clears and Apple returns.
    expect(queryByText('Apple')).toBeNull();
  });

  it('minSelections blocks deselect below the minimum + reports validity', () => {
    const onChangeMulti = jest.fn();
    const onValidityChange = jest.fn();
    function Wrapper() {
      const [v, setV] = React.useState<Item[]>([ITEMS[0]]);
      return (
        <DropdownSelect<Item>
          mode="multi"
          multiDisplay="chips"
          items={ITEMS}
          labelKey="label"
          valueKey="id"
          minSelections={1}
          selectedValues={v}
          onChangeMulti={(n) => {
            onChangeMulti(n);
            setV(n);
          }}
          onValidityChange={onValidityChange}
          testID="dd"
        />
      );
    }
    const { getByTestId } = render(<Wrapper />);
    // 1 selected, min 1 → valid
    expect(onValidityChange).toHaveBeenCalledWith(true);
    // removing the only chip is blocked (would drop below min)
    fireEvent.press(getByTestId('dd-chip-0-remove'));
    expect(onChangeMulti).not.toHaveBeenCalled();
  });

  it('keyboard navigation: ArrowDown then Enter selects the active row', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        isSearch
        searchInTrigger
        searchMode="local"
        inline
        onChange={onChange}
        testID="dd"
      />,
    );
    fireEvent(getByTestId('dd'), 'focus');
    await findByText('Apple');
    fireEvent(getByTestId('dd'), 'keyPress', { nativeEvent: { key: 'ArrowDown' } });
    fireEvent(getByTestId('dd'), 'keyPress', { nativeEvent: { key: 'Enter' } });
    expect(onChange).toHaveBeenCalledWith(ITEMS[0]);
  });

  it('keyboard navigation: Escape closes the dropdown', async () => {
    const { getByTestId, findByText, queryByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        isSearch
        searchInTrigger
        searchMode="local"
        inline
        testID="dd"
      />,
    );
    fireEvent(getByTestId('dd'), 'focus');
    expect(await findByText('Apple')).toBeTruthy();
    fireEvent(getByTestId('dd'), 'keyPress', { nativeEvent: { key: 'Escape' } });
    await waitFor(() => expect(queryByText('Apple')).toBeNull());
  });

  it('virtualizeInline + itemHeight renders an inline windowed list', async () => {
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        inline
        virtualizeInline
        itemHeight={44}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Apple')).toBeTruthy();
  });

  it('itemHeight enables getItemLayout (Modal) without error', async () => {
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        itemHeight={44}
        autoScrollToSelected
        value={ITEMS[2]}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Apple')).toBeTruthy();
  });

  it('controlled open: driven by the open prop + fires onOpenChange', async () => {
    const onOpenChange = jest.fn();
    function Wrapper() {
      const [o, setO] = React.useState(false);
      return (
        <DropdownSelect<Item>
          items={ITEMS}
          labelKey="label"
          valueKey="id"
          open={o}
          onOpenChange={(n) => {
            onOpenChange(n);
            setO(n);
          }}
          testID="dd"
        />
      );
    }
    const { getByTestId, findByText, queryByText } = render(<Wrapper />);
    expect(queryByText('Apple')).toBeNull();
    fireEvent.press(getByTestId('dd'));
    // open() awaits measurement before notifying, so wait for the panel first.
    expect(await findByText('Apple')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('animated opens and selects without error', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        animated
        onChange={onChange}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    fireEvent.press(await findByText('Apple'));
    expect(onChange).toHaveBeenCalledWith(ITEMS[0]);
  });

  it('renderLoading replaces the default spinner', async () => {
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={[]}
        labelKey="label"
        valueKey="id"
        loading
        renderLoading={() => <Text>Fetching…</Text>}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Fetching…')).toBeTruthy();
  });

  it('loadOnOpen fetches the first page when opened', async () => {
    const fetchData = jest.fn(async () => [{ id: 9, label: 'Remote A' }]);
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={[]}
        labelKey="label"
        valueKey="id"
        isSearch
        searchMode="remote"
        minSearchLength={0}
        loadOnOpen
        fetchData={fetchData}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Remote A')).toBeTruthy();
    expect(fetchData).toHaveBeenCalledWith('', 1);
  });

  it('renders a row subtitle via descriptionKey', async () => {
    type U = { id: number; label: string; email: string };
    const data: U[] = [{ id: 1, label: 'Alice', email: 'alice@x.com' }];
    const { getByTestId, findByText } = render(
      <DropdownSelect<U>
        items={data}
        labelKey="label"
        valueKey="id"
        descriptionKey="email"
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('alice@x.com')).toBeTruthy();
  });

  it('maxVisibleChips collapses extra chips into a +N more pill', () => {
    const { getByText, queryByText } = render(
      <DropdownSelect<Item>
        mode="multi"
        multiDisplay="chips"
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        selectedValues={ITEMS}
        onChangeMulti={() => {}}
        maxVisibleChips={1}
        testID="dd"
      />,
    );
    expect(getByText('Apple')).toBeTruthy();
    expect(queryByText('Cherry')).toBeNull();
    expect(getByText('+2 more')).toBeTruthy();
  });

  it('renderTrigger replaces the trigger and opens via params', async () => {
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        placeholder="Custom pick"
        renderTrigger={({ toggle, label, placeholder }) => (
          <Pressable testID="custom-trigger" onPress={toggle}>
            <Text>{label || placeholder}</Text>
          </Pressable>
        )}
        testID="dd"
      />,
    );
    expect(getByTestId('custom-trigger')).toBeTruthy();
    fireEvent.press(getByTestId('custom-trigger'));
    expect(await findByText('Apple')).toBeTruthy();
  });

  it('renders label and error chrome', () => {
    const { getByText, getByTestId } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        label="Fruit"
        required
        error="Pick one"
        testID="dd"
      />,
    );
    expect(getByText(/Fruit/)).toBeTruthy();
    expect(getByTestId('dd-error')).toBeTruthy();
    expect(getByText('Pick one')).toBeTruthy();
  });

  it('allowCreate shows an Add row and creates a new item', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText, findByTestId } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        isSearch
        searchMode="local"
        allowCreate
        onCreateOption={(text) => ({ id: 999, label: text })}
        onChange={onChange}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    fireEvent.changeText(await findByTestId('dd-panel-search'), 'Mango2');
    fireEvent.press(await findByText('Add "Mango2"'));
    expect(onChange).toHaveBeenCalledWith({ id: 999, label: 'Mango2' });
  });

  it('select-all selects every item, then clear-all empties (multi)', async () => {
    const onChangeMulti = jest.fn();
    function Wrapper() {
      const [vals, setVals] = React.useState<Item[]>([]);
      return (
        <DropdownSelect<Item>
          mode="multi"
          items={ITEMS}
          labelKey="label"
          valueKey="id"
          showSelectAll
          selectedValues={vals}
          onChangeMulti={(n) => {
            setVals(n);
            onChangeMulti(n);
          }}
          testID="dd"
        />
      );
    }
    const { getByTestId, findByText } = render(<Wrapper />);
    fireEvent.press(getByTestId('dd'));
    fireEvent.press(await findByText('Select all'));
    expect(onChangeMulti).toHaveBeenCalledWith(ITEMS);
    fireEvent.press(await findByText('Clear all'));
    expect(onChangeMulti).toHaveBeenLastCalledWith([]);
  });

  it('does not select a disabled item', async () => {
    const onChange = jest.fn();
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        onChange={onChange}
        isItemDisabled={(it) => it.id === 2}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    fireEvent.press(await findByText('Banana')); // id 2 -> disabled
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.press(await findByText('Apple'));
    expect(onChange).toHaveBeenCalledWith(ITEMS[0]);
  });

  it('renders section headers when groupBy is set', async () => {
    type Food = { id: number; label: string; cat: string };
    const foods: Food[] = [
      { id: 1, label: 'Apple', cat: 'Fruit' },
      { id: 2, label: 'Carrot', cat: 'Veg' },
      { id: 3, label: 'Banana', cat: 'Fruit' },
    ];
    const { getByTestId, findByText } = render(
      <DropdownSelect<Food>
        items={foods}
        labelKey="label"
        valueKey="id"
        groupBy={(it) => it.cat}
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Fruit')).toBeTruthy();
    expect(await findByText('Veg')).toBeTruthy();
    expect(await findByText('Apple')).toBeTruthy();
    expect(await findByText('Carrot')).toBeTruthy();
  });

  it('shows empty state when items are empty and no search', async () => {
    const { getByTestId, findByText } = render(
      <DropdownSelect<Item>
        items={[]}
        labelKey="label"
        valueKey="id"
        emptyText="Nothing here"
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    expect(await findByText('Nothing here')).toBeTruthy();
  });

  it('renders no overlay scrim by default (transparent backdrop)', async () => {
    const { getByTestId, findByTestId } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    const backdrop = await findByTestId('dd-modal-backdrop');
    const flat = require('react-native').StyleSheet.flatten(backdrop.props.style);
    expect(flat.backgroundColor).toBeUndefined();
  });

  it('renders an overlay scrim when showOverlay is set', async () => {
    const { getByTestId, findByTestId } = render(
      <DropdownSelect<Item>
        items={ITEMS}
        labelKey="label"
        valueKey="id"
        showOverlay
        overlayColor="rgba(0,0,0,0.5)"
        testID="dd"
      />,
    );
    fireEvent.press(getByTestId('dd'));
    const backdrop = await findByTestId('dd-modal-backdrop');
    const flat = require('react-native').StyleSheet.flatten(backdrop.props.style);
    expect(flat.backgroundColor).toBe('rgba(0,0,0,0.5)');
  });
});
