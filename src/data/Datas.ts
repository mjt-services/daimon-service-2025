import type { DataConnectionMap } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";

export const get = async <T = unknown>(
  body: DataConnectionMap["data.get"]["request"]["body"]
) => {
  const con = await getConnection();
  return con.request({ subject: "data.get", request: { body } }) as Promise<
    T | undefined
  >;
};

export const put = async (
  body: DataConnectionMap["data.put"]["request"]["body"]
) => {
  const con = await getConnection();
  return con.request({ subject: "data.put", request: { body } });
};

export const search = async (
  body: DataConnectionMap["data.search"]["request"]["body"]
) => {
  const con = await getConnection();
  return con.request({ subject: "data.search", request: { body } });
};

export const remove = async (
  body: DataConnectionMap["data.remove"]["request"]["body"]
) => {
  const con = await getConnection();
  return con.request({ subject: "data.remove", request: { body } });
};

export const Datas = { put, get, search, remove };
