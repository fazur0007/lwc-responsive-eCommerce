import { LightningElement, wire,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchProducts from '@salesforce/apex/VendorManagementLayer.fetchProducts';

const PAGE_SIZE = 50;

export default class infinateScrollComponent extends NavigationMixin( LightningElement ) {

    gridColumns = [{
        type: 'text',
        fieldName: 'skuCode',
        label: 'Sku Code',
        cellAttributes: { class: 'lwcCustomCss'}

    },
    {
        type: 'text',
        fieldName: 'productName',
        label: 'Product Name',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'text',
        fieldName: 'skuCode',
        label: 'Sku Code',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'text',
        fieldName: 'productName',
        label: 'Product Name',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'text',
        fieldName: 'webStatus',
        label: 'Web Status',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'text',
        fieldName: 'grindType',
        label: 'Grind Type',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'text',
        fieldName: 'bagSize',
        label: 'Bag Size',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'text',
        fieldName: 'price',
        label: 'Price',
        cellAttributes: { class: 'lwcCustomCss'}
    },
    {
        type: 'button',
        typeAttributes: {
            label: 'View'
        }
    }];

    gridData;
    initalRecords;
    frstBool = false;
    lastBool = false;
    nextBool = false;
    prevBool = false;
    offset = 0;
    pageSize = PAGE_SIZE;
    dataCount = 0;
    @wire(fetchProducts)
    productTreeData( { error, data } ) {
        if ( data ) {
            let tempData = JSON.parse( JSON.stringify( data ) );
            for ( let i = 0; i < tempData.length; i++ ) {
                tempData[ i ]._children = tempData[ i ][ 'childs' ];
                delete tempData[ i ].childs;
            }
            this.initalRecords = tempData;
        }

        if ( this.initalRecords ) {
            this.dataCount = this.initalRecords.length;
            if ( this.dataCount > this.pageSize ) {
                this.nextBool = true;
                this.lastBool = true;
            }
            this.fetchData();
        }
    }
    handleRowAction( event ) {       
        const row = event.detail.row;
        console.log( 'Row is ' + JSON.stringify( row ) );
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                actionName: 'view'
            }
        });
    }
    goPrevious() {
        this.offset -= this.pageSize;
        this.nextBool = true;
        if( this.offset === 0 ) {
            this.prevBool = false;
            this.frstBool = false;
        } else {
            this.nextBool = true;
            this.lastBool = true;      
        }        
        this.fetchData();
    }
    goNext() {
        this.offset += this.pageSize;
        this.prevBool = true;
        if ( ( this.offset + this.pageSize ) >= this.dataCount ) {
            this.nextBool = false;
            this.lastBool = false;
        } else {
            this.prevBool = true;
            this.frstBool = true;
        }        
        this.fetchData();
    }
    goFirst() {
        this.offset = 0;
        this.nextBool = true;
        this.prevBool = false;
        this.frstBool = false;
        this.lastBool = true;
        this.fetchData();
    }
    goLast() {
        this.offset = this.dataCount - ( this.dataCount % this.pageSize );
        this.nextBool = false;
        this.prevBool = true;
        this.frstBool = true;
        this.lastBool = false;
        this.fetchData();
    }
    fetchData() {
        console.log("**********"+JSON.stringify(this.initalRecords));
        this.gridData = this.initalRecords.slice( this.offset, ( this.offset + this.pageSize ) );
    }
}