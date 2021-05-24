import { LightningElement, track } from 'lwc';
import fetchRecords from '@salesforce/apex/PaginationController.fetchAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class clientSidePagination extends LightningElement {
    @track isModalOpen = false;
    @track isPanelExpand = false;
    @track objectList;
    @track selectedObject;
    @track fieldsList;
    @track pageNumber = 1;
    @track recordSize = '50';
    @track displayRecords;
    @track rowDetails;
    @track records;
    @track totalRecords = 0;
    @track totalPages = 0;
    @track columns;
    @track values;
    @track showSpinner;

    @track totalRecords = 0;
    @track totalRevenue = 0;
    @track vendorName = 'KLLR';
    @track holeBeanCount = 0;

    constructor() {
        super();
        this.showSpinner = true;
        fetchRecords()
        .then(result => {
            debugger;
            if(result != null && result != undefined) {
                this.records = JSON.parse(JSON.stringify(result));
                var uiRecords = [];
                if(result.length > Number(this.recordSize)){
                    for(var i = 0; i < Number(this.recordSize); i++) {
                        uiRecords.push(JSON.parse(JSON.stringify(result[i])));
                    }
                }else{
                    for(var i = 0; i < result.length; i++) {
                        uiRecords.push(JSON.parse(JSON.stringify(result[i])));
                    }
                }                
                this.displayRecords = JSON.parse(JSON.stringify(uiRecords));
                this.totalRecords = result.length; 
                this.totalPages = Math.ceil(result.length / Number(this.recordSize));
                this.calculateRevenue();
            }
            this.showSpinner = false;
        }).catch(error => {
            console.log(error);
            if(error && error.body && error.body.message)
                this.showNotification(error.body.message, 'error');
            this.showSpinner = false;
        })
    }
    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    handleFieldsChange(event) {
        this.selectedFields = event.detail.value;
    }

    get getRecordSizeList() {
        let recordSizeList = [];
        recordSizeList.push({'label':'10', 'value':'10'});
        recordSizeList.push({'label':'25', 'value':'25'});
        recordSizeList.push({'label':'50', 'value':'50'});
        recordSizeList.push({'label':'100', 'value':'100'});
        return recordSizeList;
    }

    handleNavigation(event){
        let buttonName = event.target.label;
        if(buttonName == 'First') {
            this.pageNumber = 1;
        } else if(buttonName == 'Next') {
            this.pageNumber = this.pageNumber >= this.totalPages ? this.totalPages : this.pageNumber + 1;
        } else if(buttonName == 'Previous') {
            this.pageNumber = this.pageNumber > 1 ? this.pageNumber - 1 : 1;
        } else if(buttonName == 'Last') {
            this.pageNumber = this.totalPages;
        }
        this.processRecords();
    }

    handleRecordSizeChange(event) {
        this.recordSize = event.detail.value;
        this.pageNumber = 1;
        this.totalPages = Math.ceil(this.totalRecords / Number(this.recordSize));
        this.processRecords();
    }

    get disablePreviousButtons() {
        if(this.pageNumber == 1)
            return true;
    }

    get disableNextButtons() {
        if(this.pageNumber == this.totalPages)
            return true;
    }
    get recordViewMessage() {
        return 'Total Records - ' + this.totalRecords + ' | Current Page - ' + this.pageNumber + '/' + this.totalPages;
    }

    processRecords() {
        var uiRecords = [];
        var startLoop = ((this.pageNumber - 1) * Number(this.recordSize));
        var endLoop =  (this.pageNumber * Number(this.recordSize) >= this.totalRecords) ? this.totalRecords : this.pageNumber * Number(this.recordSize);
        for(var i = startLoop; i < endLoop; i++) {
            uiRecords.push(JSON.parse(JSON.stringify(this.records[i])));
        }
        this.displayRecords = JSON.parse(JSON.stringify(uiRecords));
    }
    showNotification(message, variant) {
        const evt = new ShowToastEvent({
            'message': message,
            'variant': variant
        });
        this.dispatchEvent(evt);
    }
    viewDetails(event) {
        console.log(JSON.stringify(event.currentTarget.dataset.recid));
        let rowId = event.currentTarget.dataset.recid;
        if(rowId){
            this.rowDetails = this.displayRecords.find(item => item.SkuCode === rowId);
            console.log("faz result**********"+JSON.stringify(this.rowDetails.Childs));
            this.isModalOpen = true;
        }
    }
    editDetails(event){
        this.isPanelExpand = true;
        console.log(JSON.stringify(event.currentTarget.dataset.recid));
        let rowId = event.currentTarget.dataset.recid;
    }
    calculateRevenue(){
        this.totalRecords = this.records.length;
        if(this.records.length > 0){
            let revenueSum = 0;
            let holeBeanCountList = 0;
            for(let chidProduct of this.records){
                console.log(chidProduct.Childs.length);
                if(chidProduct.Childs.length > 0){
                    revenueSum += chidProduct.Childs.reduce((first, last) => parseFloat(first) + parseFloat(last.Price), 0);
                    holeBeanCountList += parseInt(chidProduct.Childs.filter(item => item.GrindType === "Whole bean").length);
                }

            }
            this.totalRevenue = revenueSum;
            this.holeBeanCount = holeBeanCountList;
        }
    }
}