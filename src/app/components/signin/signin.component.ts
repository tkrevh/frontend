import { ApiService } from './../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from './../../models/user';
import { SET_USER, CLEAR_USER } from './../../reducers/user.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  loading: boolean;
  signinForm: FormGroup;
  message: any;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private store: Store<any>
  ) {}

  ngOnInit() {
    this.loading = false;

    this.signinForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]]
    });
  }

  signin(form: FormGroup) {
    this.loading = true;
    const user = {
      email: form.value.email,
      password: form.value.password
    };

    this.apiService.signin(user).subscribe(
      data => {
        this.loading = false;
        // Current User
        const currentUser = new User();
        currentUser.email = user.email;
        currentUser.token = data['response'];
        currentUser.isLogged = true;
        // Save current user in store module
        this.store.dispatch({type: SET_USER, payload: currentUser});

        this.message = {
          type: 'success',
          message: 'Logged in successfully! Redirecting...'
        };

        this.router.navigateByUrl('/channels');

      }, err => {
        this.loading = false;

        // Remove User from store
        this.store.dispatch({type: CLEAR_USER});

        this.message = {
          type: 'danger',
          message: 'Invalid credentials!'
        };
      }
    );
  }
}
