import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/free-solid-svg-icons';

export default function Tooltip({ text }) {
    return (<ChakraTooltip hasArrow placement="top" label={text}><div className="ml-2 h-6 p-2 w-6 rounded-full border-gray-400 border-2 border-x border-y flex justify-center items-center"><FontAwesomeIcon className="text-gray-400" icon={faInfo} height={16} /></div></ChakraTooltip>)
}