"use client";
import { debounce } from "@/app/utils";
import React, { useEffect, useState } from "react";

interface TableRowProps {
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
type OrderPriorty = number | null;
type PotentialSearch = null | string;

interface SortableProps {
    text: string;
    setRows: React.Dispatch<React.SetStateAction<TableRowProps[]>>;
    rows: TableRowProps[];
    colIndex: number;
    sorter: Sorter;
    orders: PotentialOrder[];
    setOrders: React.Dispatch<React.SetStateAction<PotentialOrder[]>>;
    ascending?: number;
}

const Sortable = ({ text, colIndex, orders, setOrders }: SortableProps) => {
    const toggleOrder = () => {
        const nextOrder = OrderPath[orders[colIndex] ?? Order.NONE];
        const nextOrders = [...orders];
        nextOrders[colIndex] = nextOrder;
        setOrders(nextOrders);
    };

    let order = orders?.[colIndex] ?? Order.NONE;
    let top = order === Order.ASC ? "stroke-accent" : "stroke-subtle";
    let bottom = order === Order.DESC ? "stroke-accent" : "stroke-subtle";

    return (
        <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold tracking-wide text-muted uppercase hover:text-foreground transition-colors"
            onClick={toggleOrder}
        >
            {text}
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
    setRows: React.Dispatch<React.SetStateAction<TableRowProps[]>>;
    initialRows: TableRowProps[];
    rows: TableRowProps[];
    colIndex: number;
    filter: Filter;
    filters: PotentialFilter[];
    searches: PotentialSearch[];
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearch[]>>;
}

const Searchable = ({ text, colIndex }: SearchableProps) => {
    return (
        <span className="ml-3">
            <input
                name={`searches_${colIndex}`}
                type="text"
                className="w-full normal-case font-normal tracking-normal px-2 py-1 text-xs text-foreground bg-surface placeholder:text-subtle border border-border-strong rounded-md transition-colors focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-ring/40"
                placeholder={`Filter ${text}`}
            />
        </span>
    );
};

interface TableHeaderProps {
    text: string;
    className?: string;
    setRows: React.Dispatch<React.SetStateAction<TableRowProps[]>>;
    initialRows: TableRowProps[];
    rows: TableRowProps[];
    colIndex: number;
    sorter?: PotentialSorter;
    filter?: PotentialFilter;
    filters?: PotentialFilter[];
    searches: PotentialSearch[];
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearch[]>>;
    orders: PotentialOrder[];
    setOrders: React.Dispatch<React.SetStateAction<PotentialOrder[]>>;
}

function TableHeader({
    text,
    className,
    sorter,
    filter,
    filters,
    orders,
    ...restProps
}: TableHeaderProps) {
    return (
        <th
            scope="col"
            className={`px-6 py-3.5 ${className ?? ""}`}
            data-searchable="true"
        >
            <div className="flex items-center">
                {sorter && (
                    <Sortable
                        text={text ?? ""}
                        sorter={sorter}
                        orders={orders}
                        {...restProps}
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
                        filter={filter}
                        filters={filters as PotentialFilter[]}
                        {...restProps}
                    />
                )}
            </div>
        </th>
    );
}

function TableRow({ columns, classNames, onClick }: TableRowProps) {
    return (
        <tr
            className={`bg-surface border-b border-border last:border-0 hover:bg-surface-muted transition-colors ${
                onClick ? "cursor-pointer" : ""
            }`}
        >
            {columns.map((Element, idx) => (
                <td
                    key={idx}
                    scope="row"
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

interface Props {
    tableHeaders: THProps[];

    tableBody: TableRowProps[];

    sorters?: PotentialSorter[];
    filters?: PotentialFilter[];
    initialOrders?: PotentialOrder[];

    formRef: React.RefObject<HTMLFormElement> | null;
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

type Priority = number;

const processRows = ({
    formRef,
    initialRows,
    orders,
    searches,
    sorters,
    filters,
    priorities,
}: {
    formRef: React.RefObject<HTMLFormElement> | null;
    initialRows: TableRowProps[];
    orders: PotentialOrder[];
    searches: PotentialSearch[];
    sorters?: PotentialSorter[];
    filters?: PotentialFilter[];
    priorities?: OrderPriorty[];
}) => {
    const next = {
        orders: [...orders],
        searches: [...searches],
    };

    if (formRef?.current) {
        const formData = new FormData(formRef.current);
        for (const [key, value] of formData.entries()) {
            const [name, index] = key.split("_");
            if (name !== "orders" && name !== "searches") {
                continue;
            }
            const idx = parseInt(index);
            next[name as "orders" | "searches"][idx] = value as string;
        }
    }

    let nextRows = [...initialRows];
    for (const search of next.searches) {
        if (search && filters?.length) {
            nextRows = nextRows.filter((row) => {
                return filters.every((filter, index) => {
                    return filter && next.searches[index]
                        ? filter(next.searches[index])(row.values[index])
                        : true;
                });
            });
        }
    }

    for (const [idx, order] of next.orders.entries()) {
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

export function Table({
    tableHeaders,
    tableBody: initialRows,
    sorters,
    filters,
    initialOrders,
    formRef,
}: Props) {
    const [rows, setRows] = useState(
        processRows({
            formRef,
            initialRows,
            orders: initialOrders || [],
            searches: [],
            sorters,
            filters,
        })
    );
    const [searches, setSearches] = useState(
        new Array(filters?.length).fill(null) as PotentialSearch[]
    );
    const [orders, setOrders] = useState(
        initialOrders ||
            (new Array(filters?.length).fill(Order.NONE) as PotentialOrder[])
    );

    const handleChange = () => {
        const nextRows = processRows({
            formRef,
            initialRows,
            orders,
            searches,
            sorters,
            filters,
        });
        setRows(nextRows);
    };

    const debouncedHandleChange = debounce(handleChange, 500);

    useEffect(handleChange, [orders, initialRows]);

    return (
        <table
            className="w-full text-sm text-left rtl:text-right text-muted"
            onChange={debouncedHandleChange}
        >
            <thead className="bg-surface-muted border-b border-border">
                <tr>
                    {tableHeaders.map((headerProps, index) => (
                        <TableHeader
                            key={index}
                            {...headerProps}
                            colIndex={index}
                            initialRows={initialRows}
                            rows={rows}
                            setRows={setRows}
                            sorter={sorters?.[index]}
                            filter={filters?.[index]}
                            filters={filters}
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
                    <TableRow key={index} {...rowProps} />
                ))}
            </tbody>
        </table>
    );
}
