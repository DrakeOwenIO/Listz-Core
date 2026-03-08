export type List = {
    id: string;
    name: string;
    createdAt: Date;
  };

  export type Item = {
    id: string;
    listId: string;
    title: string;
    isDone: boolean;
    createdAt: Date;
  };