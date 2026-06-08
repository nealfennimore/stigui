import {
    Checklist,
    Role,
    TargetType,
    TechnologyArea,
} from "@/api/generated/Checklist";
import { Field, Input, Select, Textarea } from "@/app/components/ui/field";
import { useState } from "react";

export const ChecklistTargetData = ({
    checklist,
}: {
    checklist: Checklist;
}) => {
    const [isOpen, setOpen] = useState(false);
    const [isWebDatabase, setIsWebDatabase] = useState(
        checklist.target_data.is_web_database,
    );

    return (
        <div
            id="accordion-arrow-icon"
            data-accordion="open"
            className="mb-6 rounded-lg border border-border overflow-hidden"
        >
            <h2 id="accordion-arrow-icon-heading-2">
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-5 text-sm font-semibold tracking-wide uppercase text-muted bg-surface-muted hover:text-foreground transition-colors gap-3"
                    aria-expanded={isOpen}
                    aria-controls="accordion-arrow-icon-body-2"
                    onClick={() => setOpen(!isOpen)}
                >
                    <span>Metadata</span>
                    <svg
                        className={
                            `w-4 h-4 shrink-0 transition-transform` +
                            (isOpen ? " rotate-180" : "")
                        }
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5 5 1 1 5"
                        ></path>
                    </svg>
                </button>
            </h2>
            <div className={isOpen ? "" : "hidden"}>
                <div className="p-5 border-t border-border bg-surface">
                    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                        <Field label="Target Type">
                            <Select
                                name={`target_data.${checklist.id}.target_type`}
                                defaultValue={checklist.target_data.target_type}
                            >
                                {Object.values(TargetType).map((_type) => (
                                    <option key={_type} value={_type}>
                                        {_type}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Host Name">
                            <Input
                                type="text"
                                name={`target_data.${checklist.id}.host_name`}
                                defaultValue={checklist.target_data.host_name}
                            />
                        </Field>
                        <Field label="IP Address">
                            <Input
                                type="text"
                                name={`target_data.${checklist.id}.ip_address`}
                                defaultValue={checklist.target_data.ip_address}
                            />
                        </Field>
                        <Field label="MAC Address">
                            <Input
                                type="text"
                                name={`target_data.${checklist.id}.mac_address`}
                                defaultValue={checklist.target_data.mac_address}
                            />
                        </Field>
                        <Field label="FQDN">
                            <Input
                                type="text"
                                name={`target_data.${checklist.id}.fqdn`}
                                defaultValue={checklist.target_data.fqdn}
                            />
                        </Field>
                        <Field label="Comments">
                            <Textarea
                                name={`target_data.${checklist.id}.comments`}
                                defaultValue={checklist.target_data.comments}
                                rows={3}
                            />
                        </Field>
                        <Field label="Role">
                            <Select
                                name={`target_data.${checklist.id}.role`}
                                defaultValue={checklist.target_data.role}
                            >
                                {Object.values(Role).map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label="Technology Area">
                            <Select
                                name={`target_data.${checklist.id}.technology_area`}
                                defaultValue={
                                    checklist.target_data.technology_area
                                }
                            >
                                {Object.values(TechnologyArea).map((area) => (
                                    <option key={area} value={area}>
                                        {area}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border-strong text-accent focus:ring-ring/40"
                                    name={`target_data.${checklist.id}.is_web_database`}
                                    defaultChecked={
                                        checklist.target_data.is_web_database
                                    }
                                    onChange={(e) =>
                                        setIsWebDatabase(e.target.checked)
                                    }
                                />
                                <span>Is Web Database</span>
                            </label>
                        </div>
                        <div></div>
                        {isWebDatabase && (
                            <>
                                <Field label="Web DB Site">
                                    <Input
                                        type="text"
                                        name={`target_data.${checklist.id}.web_db_site`}
                                        defaultValue={
                                            checklist.target_data.web_db_site
                                        }
                                    />
                                </Field>
                                <Field label="Web DB Instance">
                                    <Input
                                        type="text"
                                        name={`target_data.${checklist.id}.web_db_instance`}
                                        defaultValue={
                                            checklist.target_data
                                                .web_db_instance
                                        }
                                        disabled={
                                            !checklist.target_data
                                                .is_web_database
                                        }
                                    />
                                </Field>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
