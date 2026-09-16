import {
    Checklist,
    Role,
    TargetData,
    TargetType,
    TechnologyArea,
} from "@/api/generated/Checklist";
import { Disclosure } from "@/app/components/ui/disclosure";
import { Field, Input, Select, Textarea } from "@/app/components/ui/field";
import { useState } from "react";

export const ChecklistTargetData = ({
    checklist,
    onChange,
}: {
    checklist: Checklist;
    onChange: (patch: Partial<TargetData>) => void;
}) => {
    const [isWebDatabase, setIsWebDatabase] = useState(
        checklist.target_data.is_web_database,
    );

    return (
        <Disclosure summary="Metadata" className="mb-6">
            <div className="p-5">
                    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                        <Field label="Target Type">
                            <Select
                                onChange={(e) => onChange({ target_type: e.target.value })}
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
                                onChange={(e) => onChange({ host_name: e.target.value })}
                                defaultValue={checklist.target_data.host_name}
                            />
                        </Field>
                        <Field label="IP Address">
                            <Input
                                type="text"
                                onChange={(e) => onChange({ ip_address: e.target.value })}
                                defaultValue={checklist.target_data.ip_address}
                            />
                        </Field>
                        <Field label="MAC Address">
                            <Input
                                type="text"
                                onChange={(e) => onChange({ mac_address: e.target.value })}
                                defaultValue={checklist.target_data.mac_address}
                            />
                        </Field>
                        <Field label="FQDN">
                            <Input
                                type="text"
                                onChange={(e) => onChange({ fqdn: e.target.value })}
                                defaultValue={checklist.target_data.fqdn}
                            />
                        </Field>
                        <Field label="Comments">
                            <Textarea
                                onChange={(e) => onChange({ comments: e.target.value })}
                                defaultValue={checklist.target_data.comments}
                                rows={3}
                            />
                        </Field>
                        <Field label="Role">
                            <Select
                                onChange={(e) => onChange({ role: e.target.value })}
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
                                onChange={(e) => onChange({ technology_area: e.target.value })}
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
                                    defaultChecked={
                                        checklist.target_data.is_web_database
                                    }
                                    onChange={(e) => {
                                        setIsWebDatabase(e.target.checked);
                                        onChange({
                                            is_web_database: e.target.checked,
                                        });
                                    }}
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
                                        onChange={(e) => onChange({ web_db_site: e.target.value })}
                                        defaultValue={
                                            checklist.target_data.web_db_site
                                        }
                                    />
                                </Field>
                                <Field label="Web DB Instance">
                                    <Input
                                        type="text"
                                        onChange={(e) => onChange({ web_db_instance: e.target.value })}
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
        </Disclosure>
    );
};
