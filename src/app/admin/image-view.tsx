import { Card } from "@tremor/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "rbrgs/trpc/react";

interface ImageViewProps {
    src: string;
    als: string;
    onClose: () => void;
    open: boolean;
}

const ImageView: React.FC<ImageViewProps> = ({ src, als, onClose, open }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await fetch(src);
                setLoading(false);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching image:', error.message);
                } else {
                    console.error('Unknown error:', error);
                }
            }
        };

        fetchData()
        .catch((error) => {
            console.error('Error fetching image:', error);
        });
        
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Card>
                <div className="flex items-center justify-between border-b pb-2">

                    <h2 className="text-xl font-bold">{als}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                {loading && <p>Loading...</p>}
                <img src={src} alt={als} />
            </Card>
        </div>
    );
};

export default ImageView;