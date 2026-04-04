declare namespace gdjs {
    /**
     * @category Utils > IndexedDB
     */
    namespace indexedDb {
        const loadFromIndexedDB: (dbName: string, objectStoreName: string, key: string) => Promise<any>;
        const saveToIndexedDB: (dbName: string, objectStoreName: string, key: string, data: any) => Promise<void>;
    }
}
