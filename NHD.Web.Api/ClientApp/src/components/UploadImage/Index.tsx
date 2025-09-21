import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadImage() {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        const mappedFiles = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );
        setFiles((prev) => [...prev, ...mappedFiles]);
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/*": [] },
        onDrop,
    });

    const removeFile = (file) => {
        setFiles(files.filter((f) => f !== file));
        URL.revokeObjectURL(file.preview); // Clean up memory
    };

    return (
        <div>
            <div
                {...getRootProps()}
                style={{
                    border: "2px dashed #888",
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: "8px",
                }}
            >
                <input {...getInputProps()} />
                <p>Drag & drop images here, or click to select</p>
            </div>

            {files.length > 0 && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        marginTop: 20,
                        gap: "10px",
                    }}
                >
                    {files.map((file, index) => (
                        <div
                            key={index}
                            style={{
                                position: "relative",
                                width: 100,
                                height: 100,
                                borderRadius: 8,
                                overflow: "hidden",
                                border: "1px solid #ccc",
                            }}
                        >
                            <img
                                src={file.preview}
                                alt="preview"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <button
                                onClick={() => removeFile(file)}
                                style={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    background: "rgba(0,0,0,0.5)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 20,
                                    height: 20,
                                    cursor: "pointer",
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
