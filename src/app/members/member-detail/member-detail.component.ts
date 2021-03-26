import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  @ViewChild( 'memberTabs', { static: true } ) memberTabs: TabsetComponent;
  activeTab: TabDirective;
  member: Member;
  messages: Message[] = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor( private membersService: MembersService, private messageService: MessageService, private route: ActivatedRoute, private toastr: ToastrService ) { }

  ngOnInit(): void {
    this.route.data
      .subscribe(
        data => this.member = data.member
      );

    this.route.queryParams
      .subscribe(
        params => params.tab ? this.selectTab( params.tab ) : this.selectTab( 0 )
      );

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];

    this.galleryImages = this.getPhotos();
  }

  getPhotos(): NgxGalleryImage[] {
    const imagesUrls = [];

    for ( const photo of this.member.photos ) {
      imagesUrls.push( {
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      } );
    }

    return imagesUrls;
  }

  loadMessages() {
    this.messageService.getMessageThread( this.member.username )
      .subscribe(
        messages => this.messages = messages
      );
  }

  addLike() {
    this.membersService.addLike( this.member.username )
      .subscribe(
        () => {
          this.toastr.success( `You have liked ${ this.member.knownAs }` );
        }
      );
  }

  selectTab( tabId: number ) {
    this.memberTabs.tabs[ tabId ].active = true;
  }

  onTabActivated( tab: TabDirective ) {
    this.activeTab = tab;

    if ( this.activeTab.heading === 'Messages' && this.messages.length === 0 ) {
      this.loadMessages();
    }
  }
  
}
