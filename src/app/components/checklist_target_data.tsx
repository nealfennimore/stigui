import {
    Checklist,
    Role,
    TargetType,
    TechnologyArea,
} from "@/api/generated/Checklist";
import { useState } from "react";

export const ChecklistTargetData = ({
    checklist,
}: {
    checklist: Checklist;
}) => {
    const [isOpen, setOpen] = useState(false);
    const [isWebDatabase, setIsWebDatabase] = useState(
        checklist.target_data.is_web_database
    );

    return (
        <>
            <div id="accordion-arrow-icon" data-accordion="open">
                <h2 id="accordion-arrow-icon-heading-2">
                    <button
                        type="button"
                        className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-zinc-500 border border-zinc-200 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-800 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-3 uppercase"
                        aria-expanded="false"
                        aria-controls="accordion-arrow-icon-body-2"
                        onClick={() => setOpen(!isOpen)}
                    >
                        <span>Metadata</span>
                        <svg
                            className={
                                `w-4 h-4 shrink-0 -me-0.5` +
                                (isOpen ? " rotate-180" : "")
                            }
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5 5 1 1 5"
                            ></path>
                        </svg>
                    </button>
                </h2>
                <div className={isOpen ? "" : "hidden"}>
                    <div className="p-5 border border-t-0 border-zinc-200 dark:border-zinc-800">
                        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                            <div>
                                <label className="block">Target Type:</label>
                                <select
                                    name={`target_data.${checklist.id}.target_type`}
                                    defaultValue={
                                        checklist.target_data.target_type
                                    }
                                    className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                >
                                    {Object.values(TargetType).map((_type) => (
                                        <option key={_type} value={_type}>
                                            {_type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block">Host Name:</label>
                                <input
                                    type="text"
                                    name={`target_data.${checklist.id}.host_name`}
                                    defaultValue={
                                        checklist.target_data.host_name
                                    }
                                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block">IP Address:</label>
                                <input
                                    type="text"
                                    name={`target_data.${checklist.id}.ip_address`}
                                    defaultValue={
                                        checklist.target_data.ip_address
                                    }
                                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block">MAC Address:</label>
                                <input
                                    type="text"
                                    name={`target_data.${checklist.id}.mac_address`}
                                    defaultValue={
                                        checklist.target_data.mac_address
                                    }
                                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block">FQDN:</label>
                                <input
                                    type="text"
                                    name={`target_data.${checklist.id}.fqdn`}
                                    defaultValue={checklist.target_data.fqdn}
                                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="block">Comments:</label>
                                <textarea
                                    name={`target_data.${checklist.id}.comments`}
                                    defaultValue={
                                        checklist.target_data.comments
                                    }
                                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block">Role:</label>
                                <select
                                    name={`target_data.${checklist.id}.role`}
                                    defaultValue={checklist.target_data.role}
                                    className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                >
                                    {Object.values(Role).map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block">
                                    Technology Area:
                                </label>
                                <select
                                    name={`target_data.${checklist.id}.technology_area`}
                                    defaultValue={
                                        checklist.target_data.technology_area
                                    }
                                    className="border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                >
                                    {Object.values(TechnologyArea).map(
                                        (area) => (
                                            <option key={area} value={area}>
                                                {area}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block">
                                    <input
                                        type="checkbox"
                                        name={`target_data.${checklist.id}.is_web_database`}
                                        defaultChecked={
                                            checklist.target_data
                                                .is_web_database
                                        }
                                        onChange={(e) =>
                                            setIsWebDatabase(e.target.checked)
                                        }
                                    />
                                    <span className="ml-2">
                                        Is Web Database
                                    </span>
                                </label>
                            </div>
                            <div></div>
                            {isWebDatabase && (
                                <>
                                    <div>
                                        <label className="block">
                                            Web DB Site:
                                        </label>
                                        <input
                                            type="text"
                                            name={`target_data.${checklist.id}.web_db_site`}
                                            defaultValue={
                                                checklist.target_data
                                                    .web_db_site
                                            }
                                            className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block">
                                            Web DB Instance:
                                        </label>
                                        <input
                                            type="text"
                                            name={`target_data.${checklist.id}.web_db_instance`}
                                            defaultValue={
                                                checklist.target_data
                                                    .web_db_instance
                                            }
                                            className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                                            disabled={
                                                !checklist.target_data
                                                    .is_web_database
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
