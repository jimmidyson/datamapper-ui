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

import { Component, Input, ViewChildren, ElementRef, QueryList, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeStyle} from '@angular/platform-browser';

import { ConfigModel } from '../models/config.model';
import { Field } from '../models/field.model';
import { DocumentDefinition } from '../models/document.definition.model';

import { DocumentFieldDetailComponent } from './document.field.detail.component';
import { LineMachineComponent } from './line.machine.component';

import { MappingManagementService } from '../services/mapping.management.service';
import { DocumentManagementService } from '../services/document.management.service';

@Component({
	selector: 'document-definition',
	template: `
	  	<div #documentDefinitionElement class='docDef' *ngIf="docDef.initCfg.initialized">
            <div class="card-pf">
      			<div class="card-pf-heading">
    				<h2 class="card-pf-title" tooltip="{{docDef.fullyQualifiedName}}" placement="bottom">
                        <div class="docName">
                            <i class="fa {{ docDef.isSource ? 'fa-hdd-o' : 'fa-download' }}"></i>
                            {{docDef.name}}                            
                        </div>
                        <i class="fa fa-search searchBoxIcon link" (click)="toggleSearch()" [attr.style]="searchIconStyle"></i>
                        <div class="clear"></div>
                    </h2>
                    
    			</div>
                <div *ngIf="searchMode" class="searchBox">
                    <input type="text" #searchFilterBox 
                        id="search-filter-box" (keyup)="search(searchFilterBox.value)" placeholder="Search"
                        [(ngModel)]="searchFilter" />
                    <i class="fa fa-close searchBoxCloseIcon link" (click)="clearSearch()"></i>
                    <div class="clear"></div>
                </div>
    			<div [attr.class]="searchMode ? 'fieldListSearchOpen' : 'fieldList'" style="overflow:auto;" 
                    (scroll)="handleScroll($event)">                
                    <document-field-detail #fieldDetail *ngFor="let f of docDef.fields" 
                        [field]="f" [docDef]="docDef" [cfg]="cfg" 
                        [lineMachine]="lineMachine"></document-field-detail>
    		    </div>
                <div class="card-pf-heading fieldsCount">{{getFieldCount()}} fields</div>
            </div>
	    </div>
    `
})

export class DocumentDefinitionComponent { 
	@Input() cfg: ConfigModel;
    @Input() docDef: DocumentDefinition;    
    @Input() lineMachine: LineMachineComponent;

    private searchMode: boolean = false;
    private searchFilter: string = "";
    public searchIconStyle: SafeStyle;
    private scrollTop: number = 0;

    constructor(private sanitizer: DomSanitizer) {}   

    @ViewChild('documentDefinitionElement') documentDefinitionElement:ElementRef;
    @ViewChildren('fieldDetail') fieldComponents: QueryList<DocumentFieldDetailComponent>;    

    private getFieldCount(): number {
        if (this.docDef && this.docDef.allFields) {
            return this.docDef.allFields.length;            
        }
        return 0;
    }

    public getFieldDetailComponent(fieldPath: string): DocumentFieldDetailComponent {
        for (let c of this.fieldComponents.toArray()) {
            var returnedComponent: DocumentFieldDetailComponent = c.getFieldDetailComponent(fieldPath);
            if (returnedComponent != null) {
                return returnedComponent;
            }
        }
        return null;
    }    

    public getElementPosition(): any {
        var x: number = 0;
        var y: number = 0;
        
        var el: any = this.documentDefinitionElement.nativeElement;
        while (el != null) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }
        y += this.scrollTop;
        return { "x": x, "y":y };
    }	

    public getFieldDetailComponentPosition(fieldPath: string): any {
        var c: DocumentFieldDetailComponent = this.getFieldDetailComponent(fieldPath);
        if (c == null) {
            return null;
        }
        var fieldElementAbsPosition: any = c.getElementPosition();
        var myAbsPosition:any = this.getElementPosition();
        return { "x": (fieldElementAbsPosition.x - myAbsPosition.x), "y": (fieldElementAbsPosition.y - myAbsPosition.y) };
    }

    private search(searchFilter: string): void {
        for (let field of this.docDef.getAllFields()) {
            field.visible = false;
        }
        for (let field of this.docDef.getTerminalFields()) {
            field.visible = (searchFilter == null || "" == searchFilter 
                || field.name.toLowerCase().includes(searchFilter.  toLowerCase()));
            if (field.visible) {
                var parentField = field.parentField;
                while (parentField != null) {
                    parentField.visible = true;
                    parentField.collapsed = false;
                    parentField = parentField.parentField;
                }
            }
        }
    }

    private clearSearch(): void  {
        this.searchFilter = "";
        this.search(this.searchFilter);
    }

    private handleScroll(event: MouseEvent) {
        var target: any = event.target;
        this.scrollTop = target.scrollTop;
        this.lineMachine.redrawLinesForMappings();
    }

    private toggleSearch(): void  {
        this.searchMode = !this.searchMode;
        if (!this.searchMode) {
            this.clearSearch();
        }
        this.searchIconStyle = !this.searchMode ? null 
            : this.sanitizer.bypassSecurityTrustStyle("color:#5CBADF;");
    } 
}