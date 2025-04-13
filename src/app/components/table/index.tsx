"use client";
import React, { useState } from "react";

interface TableRowProps {
    values: string[];
    columns: React.ReactNode[];
    classNames?: (null | string)[];
}

type Sorter = (a: any, b: any) => number;
type Filter = (search: string) => (value: string) => boolean;
type PotentialSorter = null | Sorter;
type PotentialFilter = null | Filter;

type PotentialSearches = (null | string)[];

interface SortableProps {
    text: string;
    setRows: React.Dispatch<React.SetStateAction<TableRowProps[]>>;
    rows: TableRowProps[];
    colIndex: number;
    sorter: Sorter;
    ascending?: number;
}

const Sortable = ({
    text,
    sorter,
    rows,
    setRows,
    colIndex,
    ascending,
}: SortableProps) => {
    const [currentOrder, setCurrentOrder] = useState(ascending ?? true);
    const handleSort = () => {
        const sortedRows = [...rows].sort((a, b) => {
            return currentOrder
                ? sorter(b.values[colIndex], a.values[colIndex])
                : sorter(a.values[colIndex], b.values[colIndex]);
        });
        setRows(sortedRows);
        setCurrentOrder(!currentOrder);
    };

    return (
        <button
            className="flex items-center text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-300"
            onClick={handleSort}
        >
            {text}
            <svg
                className="w-4 h-4 ms-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m8 15 4 4 4-4m0-6-4-4-4 4"
                />
            </svg>
        </button>
    );
};

interface FilterableProps {
    text: string;
    setRows: React.Dispatch<React.SetStateAction<TableRowProps[]>>;
    initialRows: TableRowProps[];
    rows: TableRowProps[];
    colIndex: number;
    filter: Filter;
    filters: PotentialFilter[];
    searches: PotentialSearches;
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearches>>;
}

const Filterable = ({
    text,
    filters,
    initialRows,
    setRows,
    colIndex,
    searches,
    setSearches,
}: FilterableProps) => {
    const handleFilter = (e: any) => {
        const nextSearch = e?.target?.value ?? "";
        const currentSearch = searches[colIndex];
        let next: TableRowProps[] = initialRows;
        if (nextSearch !== currentSearch) {
            const nextSearches = [...searches];
            nextSearches[colIndex] = nextSearch;

            next = initialRows.filter((row) => {
                return filters.every((filter, index) => {
                    return filter && nextSearches[index]
                        ? filter(nextSearches[index])(row.values[index])
                        : true;
                });
            });
            setSearches(nextSearches);
        }
        setRows(next);
    };

    return (
        <span className="ml-4">
            <input
                type="text"
                className="w-full px-2 py-1 text-xs text-zinc-700 bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Filter ${text}`}
                onChange={handleFilter}
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
    searches: PotentialSearches;
    setSearches: React.Dispatch<React.SetStateAction<PotentialSearches>>;
}

function TableHeader({
    text,
    className,
    sorter,
    filter,
    filters,
    ...restProps
}: TableHeaderProps) {
    return (
        <th
            scope="col"
            className={`px-6 py-3 uppercase whitespace-nowrap ${
                className ?? ""
            }`}
            data-searchable="true"
        >
            <div className="flex items-center">
                {sorter && (
                    <Sortable
                        text={text ?? ""}
                        sorter={sorter}
                        {...restProps}
                    />
                )}
                {!sorter && (
                    <span className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-300">
                        {text}
                    </span>
                )}
                {filter && (
                    <Filterable
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

function TableRow({ columns, classNames }: TableRowProps) {
    return (
        <tr className="odd:bg-white odd:dark:bg-zinc-900 even:bg-zinc-50 even:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200">
            {columns.map((Element, idx) => (
                <td
                    key={idx}
                    scope="row"
                    className={`px-6 py-4 text-zinc-900 whitespace-nowrap dark:text-zinc-300 whitespace-pre-line ${
                        classNames?.[idx] ?? ""
                    }`}
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

export function Table({ tableHeaders, tableBody, sorters, filters }: Props) {
    const [rows, setRows] = useState(tableBody);
    const [searches, setSearches] = useState(
        new Array(filters?.length).fill(null) as PotentialSearches
    );

    return (
        <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                <tr>
                    {tableHeaders.map((headerProps, index) => (
                        <TableHeader
                            key={index}
                            {...headerProps}
                            colIndex={index}
                            initialRows={tableBody}
                            rows={rows}
                            setRows={setRows}
                            sorter={sorters?.[index]}
                            filter={filters?.[index]}
                            filters={filters}
                            searches={searches}
                            setSearches={setSearches}
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
