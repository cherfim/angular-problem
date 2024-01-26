import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Observable } from 'rxjs';
import { AdvancedService } from './executions.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap' ;



@Component({
  selector: 'app-component',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, FormsModule, NgbModule],
  providers: [AdvancedService, DecimalPipe]
})

/**
 * Datatable Component
 */
export class AppComponent implements OnInit {

  tables$: Observable<any[]>;
  total$: Observable<number>;
  testbooks: any[] = [];

  constructor(public service: AdvancedService) {
    this.tables$ = service.jobs$;
    this.total$ = service.total$;
  }

  ngOnInit(): void {

    this.tables$.subscribe((data: any) => {
      console.log(data.length);
      this.testbooks = data;
    });
  }
}
