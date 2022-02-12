import {useCallback, useEffect, useRef, useState} from "react";
import {useDropzone} from "react-dropzone";
import Tesseract, {createWorker} from "tesseract.js";
import {Box, Icon, lighten, LinearProgress, LinearProgressProps, Stack, Typography, useTheme} from "@mui/material";
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';

export default function ImportRecipeOcr(): JSX.Element {

    const theme = useTheme()

    const workerRef = useRef<Tesseract.Worker>()
    const [ocrProgress, setOcrProgress] = useState<number>()
    const [fileDropped, setFileDropped] = useState(false)
    const [status, setStatus] = useState<string>()
    const [recipe, setRecipe] = useState<JSX.Element>()

    useEffect(
        () => {
            const worker = createWorker({
                logger: message => {
                    console.log(message)
                    if (message.status === 'recognizing text') {
                        setStatus(undefined)
                        setOcrProgress(message.progress)
                    } else if (message.status === 'initialized api') {
                        setStatus(undefined)
                        setOcrProgress(undefined)
                    } else {
                        setStatus(message.status)
                        setOcrProgress(undefined)
                    }
                }
            });

            worker.load()
                .then(() => worker.loadLanguage('eng'))
                .then(() => worker.initialize('eng'))
            workerRef.current = worker
        },
        []
    )

    const onDrop = useCallback(acceptedFiles => {
        console.log("dropped files", acceptedFiles);
        setFileDropped(true)
        setStatus(`Loading ${acceptedFiles[0].name}...`);
        (async () => {
            const {data: {text}} = await workerRef.current.recognize(acceptedFiles[0])
            console.log(text)
            setRecipe(parseText(text))
            setStatus(undefined)
            setOcrProgress(undefined)
            setFileDropped(false)
            await workerRef.current.terminate()
        })();
    }, [])

    function parseText(text: string): JSX.Element {
        return <Box sx={{minWidth: 35}}>
            {text.split(/\n/).map((para, index) => (
                <Typography key={index} variant="body2" color="text.secondary">{para}</Typography>
            ))}
        </Box>
    }

    function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
        return (
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Box sx={{width: '100%', mr: 1}}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{minWidth: 35}}>
                    <Typography variant="body2" color="text.secondary">{
                        `${Math.round(props.value,)}%`
                    }</Typography>
                </Box>
            </Box>
        );
    }

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
    return <>
        {!fileDropped ?
            <Box
                {...getRootProps()}
                sx={{
                    minWidth: 35,
                    height: 150,
                    width: 350,
                    borderRadius: 3,
                    backgroundColor: isDragActive ? lighten(theme.palette.primary.main, 0.5) : theme.palette.background.default,
                    marginBottom: 2,
                    borderStyle: 'solid',
                    borderColor: theme.palette.secondary.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Stack spacing={2}>
                    <input {...getInputProps()}/>
                    <Typography
                        // style={{fontSize: '0.9em', paddingLeft: 12, paddingTop: 13}}
                        color={theme.palette.primary.main}
                        sx={{alignSelf: 'center'}}
                    >{
                        isDragActive ?
                            "Drop files here..." :
                            "Click here to load file, or drag file to here"
                    }</Typography>
                    <Icon sx={{alignSelf: 'center'}}><DocumentScannerIcon/></Icon>
                </Stack>
            </Box> :
            <div/>
        }
        {ocrProgress !== undefined ?
            <Box sx={{width: '100%'}}>
                <Typography variant="body2" color="text.secondary">Processing...</Typography>
                <LinearProgressWithLabel value={ocrProgress * 100}/>
            </Box> :
            <Box sx={{minWidth: 35}}>
                <Typography variant="body2" color="text.secondary">{status}</Typography>
            </Box>
        }
        {recipe ? recipe : <div/>}
    </>
}