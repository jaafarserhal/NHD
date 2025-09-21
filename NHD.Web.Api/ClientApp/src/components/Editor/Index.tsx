import React, { useState, useEffect } from "react";
import ReactMde from "react-mde";
import Showdown from "showdown";
import "react-mde/lib/styles/css/react-mde-all.css";
import { Box } from "@mui/material";

interface EditorProps {
    label: string;
    value?: string;
    onChange?: (value: string) => void;
}

export default function Editor({ label, value = "", onChange }: EditorProps) {
    const [internalValue, setInternalValue] = useState(value);
    const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

    const converter = new Showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
    });

    // Sync internal value with prop value
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    const handleChange = (newValue: string) => {
        setInternalValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <Box>
            <h5 className="text-2xl mb-6 text-center" style={{ fontWeight: 500 }}>{label}</h5>
            <div className="max-w-2xl mx-auto my-8">
                <ReactMde
                    value={internalValue}
                    onChange={handleChange}
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    generateMarkdownPreview={(markdown) =>
                        Promise.resolve(converter.makeHtml(markdown))
                    }
                />
            </div>
        </Box>
    );
}