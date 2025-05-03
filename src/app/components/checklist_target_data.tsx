import {
    Checklist,
    Role,
    TargetType,
    TechnologyArea,
} from "@/api/generated/Checklist";

export const ChecklistTargetData = ({
    checklist,
}: {
    checklist: Checklist;
}) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block">Target Type:</label>
                <select
                    name={`target_data.${checklist.id}.target_type`}
                    defaultValue={checklist.target_data.target_type}
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
                    defaultValue={checklist.target_data.host_name}
                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                />
            </div>
            <div>
                <label className="block">IP Address:</label>
                <input
                    type="text"
                    name={`target_data.${checklist.id}.ip_address`}
                    defaultValue={checklist.target_data.ip_address}
                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                />
            </div>
            <div>
                <label className="block">MAC Address:</label>
                <input
                    type="text"
                    name={`target_data.${checklist.id}.mac_address`}
                    defaultValue={checklist.target_data.mac_address}
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
                    defaultValue={checklist.target_data.comments}
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
                    <input
                        type="checkbox"
                        name={`target_data.${checklist.id}.is_web_database`}
                        defaultChecked={checklist.target_data.is_web_database}
                    />
                    <span className="ml-2">Is Web Database</span>
                </label>
            </div>
            <div>
                <label className="block">Technology Area:</label>
                <select
                    name={`target_data.${checklist.id}.technology_area`}
                    defaultValue={checklist.target_data.technology_area}
                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                >
                    {Object.values(TechnologyArea).map((area) => (
                        <option key={area} value={area}>
                            {area}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block">Web DB Site:</label>
                <input
                    type="text"
                    name={`target_data.${checklist.id}.web_db_site`}
                    defaultValue={checklist.target_data.web_db_site}
                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                    disabled={!checklist.target_data.is_web_database}
                />
            </div>
            <div>
                <label className="block">Web DB Instance:</label>
                <input
                    type="text"
                    name={`target_data.${checklist.id}.web_db_instance`}
                    defaultValue={checklist.target_data.web_db_instance}
                    className="w-full border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-2 text-zinc-900 dark:text-zinc-300 bg-white dark:bg-zinc-800"
                    disabled={!checklist.target_data.is_web_database}
                />
            </div>
        </div>
    );
};
