/*
	Copyright (C) 2017 Red Hat, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	        http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

import { MappingDefinition } from './mapping.definition.model';
import { DocumentDefinition } from './document.definition.model';

import { ErrorHandlerService } from '../services/error.handler.service';
import { DocumentManagementService } from '../services/document.management.service';
import { MappingManagementService } from '../services/mapping.management.service';
import { InitializationService } from '../services/initialization.service';

export class DataMapperInitializationModel {
	public initialized: boolean = false;
	public loadingStatus: string = "Loading."
	public initializationErrorOccurred: boolean = false;

	public baseJavaServiceUrl: string;
	public baseMappingServiceUrl: string;

	/* class path fetching configuration */
	public classPathFetchTimeoutInMilliseconds: number = 30000;
	// if classPath is specified, maven call to resolve pom will be skipped
	public pomPayload: string;
	
	public classPath: string;

	/* inspection service filtering flags */
	public fieldNameBlacklist: string[] = [];
	public classNameBlacklist: string[] = [];
	public disablePrivateOnlyFields: boolean = false;
	public disableProtectedOnlyFields: boolean = false;
	public disablePublicOnlyFields: boolean = false;
	public disablePublicGetterSetterFields: boolean = false;

}

export class ConfigModel {
	public initCfg: DataMapperInitializationModel = new DataMapperInitializationModel;

	/* current ui state config */
	public showMappingDetailTray: boolean = false;
	public showMappingDataType: boolean = false;
	public showLinesAlways: boolean = false;
	public debugParsing: boolean = false;

	public documentService: DocumentManagementService;
	public mappingService: MappingManagementService;
	public errorService: ErrorHandlerService;	
	public initializationService: InitializationService;

	public sourceDocs: DocumentDefinition[] = [];
	public targetDocs: DocumentDefinition[] = [];
	public mappingFiles: string[] = [];

	public mappings: MappingDefinition = null;

	public getDoc(isSource: boolean): DocumentDefinition {
		return isSource ? this.sourceDocs[0] : this.targetDocs[0];
	}

	public getAllDocs(): DocumentDefinition[] {
		return [].concat(this.sourceDocs).concat(this.targetDocs);
	}

	public documentsAreLoaded(): boolean {
		for (let d of this.getAllDocs()) {
			if (!d.initCfg.initialized) {
				return false;
			}
		}
		return true;
	}
}