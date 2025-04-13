"use client";
import React, { useState } from "react";

interface TableRowProps {
    values: string[];
    columns: React.ReactNode[];
}

type Sorter = (a: any, b: any) => number;
type PotentialSorter = null | Sorter;

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

interface TableHeaderProps {
    text: string;
    className?: string;
    setRows: React.Dispatch<React.SetStateAction<TableRowProps[]>>;
    rows: TableRowProps[];
    colIndex: number;
    sorter?: PotentialSorter;
}

function TableHeader({
    text,
    className,
    sorter,
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
            {sorter ? (
                <Sortable text={text ?? ""} sorter={sorter} {...restProps} />
            ) : (
                <span className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-300">
                    {text}
                </span>
            )}
        </th>
    );
}

function TableRow({ columns }: TableRowProps) {
    return (
        <tr className="odd:bg-white odd:dark:bg-zinc-900 even:bg-zinc-50 even:dark:bg-zinc-800 border-b dark:border-zinc-700 border-zinc-200">
            {columns.map((Element, idx) => (
                <td
                    key={idx}
                    scope="row"
                    className="px-6 py-4 text-zinc-900 whitespace-nowrap dark:text-zinc-300 whitespace-pre-line"
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
}

export const defaultSort = (a: any, b: any) => {
    if (!isNaN(Number(a)) && !isNaN(Number(b))) {
        return a.localeCompare(b, undefined, {
            numeric: true,
        });
    }
    return a.localeCompare(b);
};

export function Table({ tableHeaders, tableBody, sorters }: Props) {
    const [rows, setRows] = useState(tableBody);

    return (
        <table className="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-400">
                <tr>
                    {tableHeaders.map((headerProps, index) => (
                        <TableHeader
                            key={index}
                            {...headerProps}
                            colIndex={index}
                            rows={rows}
                            setRows={setRows}
                            sorter={sorters?.[index]}
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
