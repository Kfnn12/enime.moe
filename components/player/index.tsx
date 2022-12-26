'use client';

import { enimeApi } from '@/lib/constant';
import { useEffect, useRef, useState } from 'react';
import { AniSkip, Episode } from '@/lib/types';
import Player from '@oplayer/core';
import ui from '@oplayer/ui';
import hls from '@oplayer/hls';
import { sourceUrlToName } from '@/lib/helper';
import { Highlight } from '@oplayer/ui/src/types';
import { skipOpEd } from '@/lib/player/plugin/skip-op-ed';
import { start } from 'repl';

export default function EnimePlayer(props) {
    const { sources, number, image, anime } = props.episode as Episode;
    const [sourceIndex, setSourceIndex] = useState(0);

    const playerContainerRef = useRef<HTMLDivElement>();
    const playerRef = useRef<Player>();

    const [source, setSource] = useState(undefined);
    // const { data: source, error } = useSWR<Source>(enimeApi + `/source/${sources[sourceIndex].id}`, url => fetch(url, { cache: "no-store" }).then(res => res.json()));
    const poster = !image ? undefined : `https://images.weserv.nl/?url=${image}`;

    useEffect(() => {
        if (playerRef.current) return;
        playerRef.current = Player.make(playerContainerRef.current)
            .use([
                skipOpEd(),
                ui({
                    pictureInPicture: true,
                    subtitle: {
                        source: [],
                        fontSize: 30
                    },
                    menu: [
                        {
                            name: 'Source',
                            children: sources.map((source) => {
                                return {
                                    name: sourceUrlToName(source.url),
                                    default: source.url.includes('gogoanime'),
                                    value: source.id
                                }
                            }),
                            onChange({ value }) {
                                setSourceIndex(sources.findIndex((source) => source.id === value));
                            },
                        }
                    ]
                }),
                hls({
                    qualityControl: true,
                    qualitySwitch: 'immediate',
                })
            ])
            .create()
            .on(['error', 'pluginerror'], ({ type, payload }) => {
                if (payload?.fatal) {
                    setSourceIndex(sourceIndex + 1);
                }
            });
    }, []);

    useEffect(() => {
        fetch(enimeApi + `/source/${sources[sourceIndex].id}`)
            .then((res) => res.json())
            .then((res) => {
                setSource({
                    ...res,
                    url: sources[sourceIndex].url.includes('zoro')
                        ? `https://cors.proxy.consumet.org/${res.url}`
                        : res.url,
                });
            });
    }, [sourceIndex]);

    useEffect(() => {
        if (source) {
            playerRef.current.changeSource({
                src: source.url,
                ...(poster && {
                    poster: poster,
                }),
            }).then(() => {
                if (anime.mappings.mal) {
                    fetch(`https://api.aniskip.com/v2/skip-times/${anime.mappings.mal}/${number}?types=op&types=recap&types=mixed-op&types=ed&types=mixed-ed&episodeLength=0`)
                        .then(res => res.json())
                        .then(res => {
                            res = res as AniSkip;

                            const highlights: Highlight[] = []
                            let opDuration = [], edDuration = [];

                            if (res.statusCode === 200) {
                                for (let result of res.results) {
                                    if (result.skipType === "op" || result.skipType === "ed") {
                                        const { startTime, endTime } = result.interval;

                                        if (startTime) {
                                            highlights.push({
                                                time: startTime,
                                                text: result.skipType === "op" ? "OP" : "ED"
                                            });
                                            if (result.skipType === "op") opDuration.push(startTime);
                                            else edDuration.push(startTime);
                                        }

                                        if (endTime) {
                                            highlights.push({
                                                time: endTime,
                                                text: result.skipType === "op" ? "OP" : "ED"
                                            });
                                            if (result.skipType === "op") opDuration.push(endTime);
                                            else edDuration.push(endTime);
                                        }
                                    }
                                }
                            }

                            playerRef.current.emit("opedchange", [opDuration, edDuration]);
                            playerRef.current.plugins.ui.highlight(highlights)
                        });
                }

                if (source.subtitle) {
                    playerRef.current.plugins.ui.subtitle.updateSource([
                        {
                            default: true,
                            src: source.subtitle,
                            name: 'English',
                        },
                    ]);
                }
            });
        }
    }, [source]);

    return (
        <div className={props.className}>
            <div className="w-full h-full p-0 m-0" ref={playerContainerRef} />
        </div>
    )
}
