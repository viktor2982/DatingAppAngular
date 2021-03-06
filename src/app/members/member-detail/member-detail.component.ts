import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/User';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {

  @ViewChild( 'memberTabs', { static: true } ) memberTabs: TabsetComponent;
  activeTab: TabDirective;
  member: Member;
  messages: Message[] = [];
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(
    private membersService: MembersService,
    private messageService: MessageService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    public presence: PresenceService,
    ) {
      this.accountService.currentUser$
        .pipe( take( 1 ) )
        .subscribe(
          user => this.user = user
        );
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

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
      this.messageService.createHubConnection( this.user, this.member.username );
    }
    else {
      this.messageService.stopHubConnection();
    }
  }

}
