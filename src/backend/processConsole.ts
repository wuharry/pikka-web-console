
type props{
    type:'log'|'error'|'warn'|'info';
    message: string;
}

export function processConsole({type, message}: props) {
    console[type](message);
}
