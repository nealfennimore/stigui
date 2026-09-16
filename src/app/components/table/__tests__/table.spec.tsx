import { fireEvent, render, screen, within } from "@testing-library/react";
import { useRef } from "react";
import { defaultFilter, defaultSort, Order, Table } from "@/app/components/table";

const ROWS = [
    { values: ["banana", "2"], columns: ["banana", "2"] },
    { values: ["apple", "3"], columns: ["apple", "3"] },
    { values: ["cherry", "1"], columns: ["cherry", "1"] },
];

const Harness = ({ initialOrders }: { initialOrders?: (Order | null)[] }) => {
    const formRef = useRef<HTMLFormElement>(null);
    return (
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <Table
                tableHeaders={[{ text: "Fruit" }, { text: "Count" }]}
                tableBody={ROWS}
                sorters={[defaultSort, null]}
                filters={[defaultFilter, null]}
                initialOrders={initialOrders ?? [Order.NONE, Order.NONE]}
                formRef={formRef}
            />
        </form>
    );
};

const bodyRowText = () => {
    const [, ...rows] = screen.getAllByRole("row");
    return rows.map((row) => within(row).getAllByRole("cell")[0].textContent);
};

describe("Table", () => {
    it("renders rows in the given order by default", () => {
        render(<Harness />);
        expect(bodyRowText()).toEqual(["banana", "apple", "cherry"]);
    });

    it("applies initialOrders on first render", () => {
        render(<Harness initialOrders={[Order.ASC, Order.NONE]} />);
        expect(bodyRowText()).toEqual(["apple", "banana", "cherry"]);
    });

    it("cycles sort asc → desc → none on header clicks", () => {
        render(<Harness />);
        const sortButton = screen.getByRole("button", { name: /fruit/i });

        fireEvent.click(sortButton);
        expect(bodyRowText()).toEqual(["apple", "banana", "cherry"]);

        fireEvent.click(sortButton);
        expect(bodyRowText()).toEqual(["cherry", "banana", "apple"]);

        fireEvent.click(sortButton);
        expect(bodyRowText()).toEqual(["banana", "apple", "cherry"]);
    });

    it("narrows rows with the column filter after the debounce", () => {
        jest.useFakeTimers();
        try {
            render(<Harness />);
            const input = screen.getByPlaceholderText("Filter Fruit");

            fireEvent.change(input, { target: { value: "app" } });
            expect(bodyRowText()).toEqual(["banana", "apple", "cherry"]);

            fireEvent(
                window,
                new Event("noop") // flush nothing; advance the debounce below
            );
            jest.advanceTimersByTime(500);
            expect(bodyRowText()).toEqual(["apple"]);
        } finally {
            jest.useRealTimers();
        }
    });

    it("clears the filter and restores all rows", () => {
        jest.useFakeTimers();
        try {
            render(<Harness />);
            const input = screen.getByPlaceholderText("Filter Fruit");

            fireEvent.change(input, { target: { value: "cherry" } });
            jest.advanceTimersByTime(500);
            expect(bodyRowText()).toEqual(["cherry"]);

            fireEvent.change(input, { target: { value: "" } });
            jest.advanceTimersByTime(500);
            expect(bodyRowText()).toEqual(["banana", "apple", "cherry"]);
        } finally {
            jest.useRealTimers();
        }
    });
});
