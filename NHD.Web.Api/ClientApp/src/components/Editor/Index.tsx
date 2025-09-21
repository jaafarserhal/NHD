import React, { useState } from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { Box } from "@mui/material";

export default function Editor({ label }: { label: string }) {
    const [value, setValue] = useState("");
    const [selectedTab, setSelectedTab] = useState("write");

    const converter = new Showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
    });

    return (
        <Box sx={{ marginLeft: '10px' }}>
            <h5 className="text-2xl mb-6 text-center" style={{ fontWeight: 500 }}>{label}</h5>
            <div className="max-w-2xl mx-auto my-8">
                <ReactMde
                    value={value}
                    onChange={setValue}
                    selectedTab={selectedTab as "write" | "preview"}
                    onTabChange={setSelectedTab}
                    generateMarkdownPreview={(markdown) =>
                        Promise.resolve(converter.makeHtml(markdown))
                    }
                />
            </div>
        </Box>
    );
}
