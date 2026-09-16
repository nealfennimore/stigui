"use client";
import { Input, Select } from "@/app/components/ui/field";
import React, { useEffect, useMemo, useState } from "react";

export interface TableRowProps {
    values: string[];
    columns: React.ReactNode[];
    classNames?: (null | string)[];
    onClick?: (null | ((index: number) => void)) | (() => void);
}

export enum Order {
    ASC = "asc",
    DESC = "desc",
    NONE = "none",
}

export interface ColumnOrder {
    order: Order;
    priority?: number;
}

const OrderPath = {
    ["asc"]: Order.DESC,
    ["desc"]: Order.NONE,
    ["none"]: Order.ASC,
};

type Sorter = (a: any, b: any) => number;
type Filter = (search: string) => (value: string) => boolean;
type PotentialSorter = null | Sorter;
type PotentialFilter = null | Filter;
type PotentialOrder = null | Order;
type PotentialSearch = null | string;

const ariaSort: Record<Order, "ascending" | "descending" | undefined> = {
    [Order.ASC]: "ascending",
    [Order.DESC]: "descending",
    [Order.NONE]: undefined,
};

interface SortableProps {
    text: string;
    colIndex: number;
    orders: PotentialOrder[];
    setOrders: React.Dispatch<React.SetStateAction<PotentialOrder[]>>;
}

const Sortable = ({ text, colIndex, orders, setOrders }: SortableProps) => {
    const order = orders?.[colIndex] ?? Order.NONE;
    const toggleOrder = () => {
        const nextOrders = [...orders];
        nextOrders[colIndex] = OrderPath[order];
        setOrders(nextOrders);
    };

    const top = order === Order.ASC ? "stroke-accent" : "stroke-subtle";
    const bottom = order === Order.DESC ? "stroke-accent" : "stroke-subtle";

    return (
        <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted uppercase hover:text-foreground transition-colors"
            onClick={toggleOrder}
        >
            {text}
            {order !== Order.NONE && (
                <span className="sr-only">
                    , sorted {order === Order.ASC ? "ascending" : "descending"}
                </span>
            )}
            {/* The editor's outer form serializes sort state from this input. */}
            <input type="hidden" name={`orders_${colIndex}`} value={order} />
            <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    className={top}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m12 5 4 4-4-4-4 4"
                />
                <path
                    className={bottom}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m12 19 4-4-4 4-4-4"
                />
            </svg>
        </button>
    );
};

interface SearchableProps {
    text: string;
    colIndex: number;
    searches: PotentialSearch[];
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearch[]>>;
}

const Searchable = ({
    text,
    colIndex,
    searches,
    setSearches,
}: SearchableProps) => {
    return (
        <span className="ml-3">
            <input
                name={`searches_${colIndex}`}
                type="text"
                aria-label={`Filter ${text}`}
                value={searches[colIndex] ?? ""}
                onChange={(event) => {
                    const value = event.target.value;
                    setSearches((previous) => {
                        const next = [...previous];
                        next[colIndex] = value;
                        return next;
                    });
                }}
                className="w-full normal-case font-normal tracking-normal px-2 py-1 text-xs text-foreground bg-surface placeholder:text-subtle border border-border-strong rounded-md transition-colors focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-ring/40"
                placeholder={`Filter ${text}`}
            />
        </span>
    );
};

interface TableHeaderProps {
    text: string;
    className?: string;
    colIndex: number;
    sorter?: PotentialSorter;
    filter?: PotentialFilter;
    searches: PotentialSearch[];
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearch[]>>;
    orders: PotentialOrder[];
    setOrders: React.Dispatch<React.SetStateAction<PotentialOrder[]>>;
}

function TableHeader({
    text,
    className,
    colIndex,
    sorter,
    filter,
    searches,
    setSearches,
    orders,
    setOrders,
}: TableHeaderProps) {
    const order = orders?.[colIndex] ?? Order.NONE;
    return (
        <th
            scope="col"
            aria-sort={sorter ? ariaSort[order] : undefined}
            className={`px-6 py-3.5 ${className ?? ""}`}
        >
            <div className="flex items-center">
                {sorter && (
                    <Sortable
                        text={text ?? ""}
                        colIndex={colIndex}
                        orders={orders}
                        setOrders={setOrders}
                    />
                )}
                {!sorter && (
                    <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                        {text}
                    </span>
                )}
                {filter && (
                    <Searchable
                        text={text ?? ""}
                        colIndex={colIndex}
                        searches={searches}
                        setSearches={setSearches}
                    />
                )}
            </div>
        </th>
    );
}

function TableRow({
    columns,
    classNames,
    onClick,
    selected = false,
}: TableRowProps & { selected?: boolean }) {
    return (
        <tr
            data-selected={selected || undefined}
            className={`border-b border-border last:border-0 hover:bg-surface-muted transition-colors ${
                selected ? "bg-accent-subtle" : "bg-surface"
            } ${onClick ? "cursor-pointer" : ""}`}
        >
            {columns.map((Element, idx) => (
                <td
                    key={idx}
                    className={`px-6 py-4 text-foreground whitespace-pre-line ${
                        classNames?.[idx] ?? ""
                    }`}
                    onClick={onClick}
                >
                    {Element}
                </td>
            ))}
        </tr>
    );
}

interface THProps {
    text: string;
    className?: string;
}

export interface TableMobileOptions {
    /** Column rendered as the card title. Defaults to the first column. */
    primaryColumn?: number;
    /** Columns omitted from the cards (for example long descriptions). */
    hiddenColumns?: number[];
    /** Full custom card renderer. */
    renderCard?: (row: TableRowProps, index: number) => React.ReactNode;
    /** Render sort/filter controls above the cards. Defaults to true. */
    controls?: boolean;
}

interface Props {
    tableHeaders: THProps[];

    tableBody: TableRowProps[];

    sorters?: PotentialSorter[];
    filters?: PotentialFilter[];
    initialOrders?: PotentialOrder[];

    formRef?: React.RefObject<HTMLFormElement> | null;

    /** Rendered as an sr-only <caption>. */
    caption?: string;

    /**
     * When set, the <table> hides below md and a card list renders instead
     * of hiding columns.
     */
    mobile?: TableMobileOptions;

    /** Stable key for a row; required for selection and visible-row APIs. */
    rowKey?: (row: TableRowProps, index: number) => string;
    /** Row key to highlight as selected. */
    selectedKey?: string | null;
    /**
     * Called with the row keys currently visible (after filter and sort).
     * Memoize the callback; it fires whenever the processed rows change.
     */
    onVisibleRowsChange?: (keys: string[]) => void;
}

export const defaultSort = (a: any, b: any) => {
    if (!isNaN(Number(a)) && !isNaN(Number(b))) {
        return a.localeCompare(b, undefined, {
            numeric: true,
        });
    }
    return a.localeCompare(b);
};

export const defaultFilter = (search: string) => (value: string) =>
    value.toLocaleLowerCase().includes(search.toLocaleLowerCase());

const processRows = ({
    initialRows,
    orders,
    searches,
    sorters,
    filters,
}: {
    initialRows: TableRowProps[];
    orders: PotentialOrder[];
    searches: PotentialSearch[];
    sorters?: PotentialSorter[];
    filters?: PotentialFilter[];
}) => {
    let nextRows = [...initialRows];
    if (filters?.length && searches.some(Boolean)) {
        nextRows = nextRows.filter((row) => {
            return filters.every((filter, index) => {
                return filter && searches[index]
                    ? filter(searches[index])(row.values[index])
                    : true;
            });
        });
    }

    for (const [idx, order] of orders.entries()) {
        const sorter = sorters?.[idx];
        if (order && order !== Order.NONE && sorter) {
            nextRows.sort((a, b) => {
                return order === Order.DESC
                    ? sorter(b.values[idx], a.values[idx])
                    : sorter(a.values[idx], b.values[idx]);
            });
        }
    }

    return nextRows;
};

/** Trailing debounce for filter input values. */
const useDebouncedValue = <T,>(value: T, delay: number): T => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};

const MobileControls = ({
    tableHeaders,
    sorters,
    filters,
    orders,
    setOrders,
    searches,
    setSearches,
}: {
    tableHeaders: THProps[];
    sorters?: PotentialSorter[];
    filters?: PotentialFilter[];
    orders: PotentialOrder[];
    setOrders: React.Dispatch<React.SetStateAction<PotentialOrder[]>>;
    searches: PotentialSearch[];
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearch[]>>;
}) => {
    const sortableColumns = tableHeaders
        .map((header, index) => ({ header, index }))
        .filter(({ index }) => sorters?.[index]);
    const filterColumn = tableHeaders.findIndex(
        (_, index) => filters?.[index]
    );

    const activeSort = orders.findIndex(
        (order) => order && order !== Order.NONE
    );
    const sortValue =
        activeSort > -1 ? `${activeSort}:${orders[activeSort]}` : "";

    return (
        <div className="flex items-center gap-2 p-3 border-b border-border bg-surface-muted">
            {sortableColumns.length > 0 && (
                <Select
                    aria-label="Sort by"
                    className="text-xs py-1.5"
                    value={sortValue}
                    onChange={(event) => {
                        const next = new Array(orders.length).fill(
                            Order.NONE
                        ) as PotentialOrder[];
                        if (event.target.value) {
                            const [index, order] =
                                event.target.value.split(":");
                            next[parseInt(index)] = order as Order;
                        }
                        setOrders(next);
                    }}
                >
                    <option value="">Sort: default</option>
                    {sortableColumns.map(({ header, index }) => (
                        <React.Fragment key={index}>
                            <option value={`${index}:${Order.ASC}`}>
                                {header.text} ↑
                            </option>
                            <option value={`${index}:${Order.DESC}`}>
                                {header.text} ↓
                            </option>
                        </React.Fragment>
                    ))}
                </Select>
            )}
            {filterColumn > -1 && (
                <Input
                    type="text"
                    aria-label={`Filter ${tableHeaders[filterColumn].text}`}
                    placeholder={`Filter ${tableHeaders[filterColumn].text}`}
                    className="text-xs py-1.5"
                    value={searches[filterColumn] ?? ""}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearches((previous) => {
                            const next = [...previous];
                            next[filterColumn] = value;
                            return next;
                        });
                    }}
                />
            )}
        </div>
    );
};

const MobileCard = ({
    row,
    index,
    tableHeaders,
    mobile,
    selected,
}: {
    row: TableRowProps;
    index: number;
    tableHeaders: THProps[];
    mobile: TableMobileOptions;
    selected: boolean;
}) => {
    if (mobile.renderCard) {
        return <li>{mobile.renderCard(row, index)}</li>;
    }

    const primary = mobile.primaryColumn ?? 0;
    const hidden = new Set(mobile.hiddenColumns ?? []);
    const details = row.columns
        .map((column, columnIndex) => ({ column, columnIndex }))
        .filter(
            ({ columnIndex }) =>
                columnIndex !== primary &&
                !hidden.has(columnIndex) &&
                tableHeaders[columnIndex]?.text
        );

    const content = (
        <>
            <div className="text-sm font-medium text-foreground">
                {row.columns[primary]}
            </div>
            {details.length > 0 && (
                <dl className="flex flex-wrap gap-x-4 gap-y-1">
                    {details.map(({ column, columnIndex }) => (
                        <div
                            key={columnIndex}
                            className="flex items-center gap-1.5"
                        >
                            <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
                                {tableHeaders[columnIndex].text}
                            </dt>
                            <dd className="text-sm text-muted">{column}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </>
    );

    return (
        <li
            data-selected={selected || undefined}
            className={selected ? "bg-accent-subtle" : ""}
        >
            {row.onClick ? (
                <button
                    type="button"
                    onClick={row.onClick}
                    className="w-full text-left flex flex-col gap-2 p-4 hover:bg-surface-muted transition-colors"
                >
                    {content}
                </button>
            ) : (
                <div className="flex flex-col gap-2 p-4">{content}</div>
            )}
        </li>
    );
};

export function Table({
    tableHeaders,
    tableBody: initialRows,
    sorters,
    filters,
    initialOrders,
    // Kept for API compatibility; sort/filter state is now internal, but
    // the hidden orders_N inputs still serialize into the enclosing form.
    formRef, // eslint-disable-line @typescript-eslint/no-unused-vars
    caption,
    mobile,
    rowKey,
    selectedKey,
    onVisibleRowsChange,
}: Props) {
    const columnCount = tableHeaders.length;
    const [orders, setOrders] = useState<PotentialOrder[]>(
        () =>
            initialOrders ??
            (new Array(columnCount).fill(Order.NONE) as PotentialOrder[])
    );
    const [searches, setSearches] = useState<PotentialSearch[]>(
        () => new Array(columnCount).fill(null) as PotentialSearch[]
    );
    const debouncedSearches = useDebouncedValue(searches, 300);

    const rows = useMemo(
        () =>
            processRows({
                initialRows,
                orders,
                searches: debouncedSearches,
                sorters,
                filters,
            }),
        [initialRows, orders, debouncedSearches, sorters, filters]
    );

    useEffect(() => {
        if (rowKey && onVisibleRowsChange) {
            onVisibleRowsChange(rows.map(rowKey));
        }
    }, [rows, rowKey, onVisibleRowsChange]);

    const isSelected = (row: TableRowProps, index: number) =>
        !!rowKey && selectedKey != null && rowKey(row, index) === selectedKey;

    return (
        <>
            <table
                className={`w-full text-sm text-left rtl:text-right text-muted ${
                    mobile ? "max-md:hidden" : ""
                }`}
            >
                {caption && <caption className="sr-only">{caption}</caption>}
                <thead className="bg-surface-muted border-b border-border">
                    <tr>
                        {tableHeaders.map((headerProps, index) => (
                            <TableHeader
                                key={index}
                                {...headerProps}
                                colIndex={index}
                                sorter={sorters?.[index]}
                                filter={filters?.[index]}
                                searches={searches}
                                setSearches={setSearches}
                                orders={orders}
                                setOrders={setOrders}
                            />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((rowProps, index) => (
                        <TableRow
                            key={rowKey ? rowKey(rowProps, index) : index}
                            {...rowProps}
                            selected={isSelected(rowProps, index)}
                        />
                    ))}
                </tbody>
            </table>
            {mobile && (
                <div className="md:hidden">
                    {(mobile.controls ?? true) && (
                        <MobileControls
                            tableHeaders={tableHeaders}
                            sorters={sorters}
                            filters={filters}
                            orders={orders}
                            setOrders={setOrders}
                            searches={searches}
                            setSearches={setSearches}
                        />
                    )}
                    <ul className="flex flex-col divide-y divide-border">
                        {rows.map((rowProps, index) => (
                            <MobileCard
                                key={rowKey ? rowKey(rowProps, index) : index}
                                row={rowProps}
                                index={index}
                                tableHeaders={tableHeaders}
                                mobile={mobile}
                                selected={isSelected(rowProps, index)}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}
