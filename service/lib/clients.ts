
export type client = {
    clientID: string;
    name: string;
}

export const clients: Array<client> = [];

export function addClient(id: string, name: string): void {

    for (let c of clients) {
        if (c.clientID === id) {
            throw new Error(`Client ${id} already exists with name ${c.name}`);
        }
    }

    clients.push(<client>{
        clientID: id,
        name: name
    });
}

export function findClient(id: string): client {
    for (let c of clients) {
        if (c.clientID === id) return c;
    }
    return undefined;
}

export const isClient = (id: string): boolean => {
    let c = findClient(id);
    return typeof c !== 'undefined' && c !== null;
};

export const clientForReq = (req) => {
    const authcode = req.headers['authcode'];
    return findClient(authcode);
}

export const reqFromClient = (req, res, next) => {
    const authcode = req.headers['authcode'];
    if (isClient(authcode)) next();
    else next(new Error(`Invalid client code ${authcode}`));
};
