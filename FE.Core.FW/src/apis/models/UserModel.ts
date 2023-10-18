/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PolicyModel } from "./PolicyModel";
import type { UserMetadataModel } from "./UserMetadataModel";

export type UserModel = {
  id?: string;
  username?: string | null;
  fullname?: string | null;
  email?: string | null;
  dob?: Date;
  phone?: string | null;
  metadata?: Array<UserMetadataModel> | null;
  roleId?: string | null;
  roleName?: string | null;
  isDisabled?: boolean;
  syncId?: string | null;
  iigDepartmentId?: string | null;
  iigDepartmentName?: string | null;
  permissions?: Array<PolicyModel> | null;
  accessDataHeaderQuater?: Array<string> | null;
};

