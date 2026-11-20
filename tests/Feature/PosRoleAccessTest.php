<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('unauthenticated visitor is redirected to pos login', function () {
    $response = $this->get('/pos');
    $response->assertRedirect('/pos/login');
});

test('pos login screen can be rendered', function () {
    $response = $this->get('/pos/login');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('pos/login'));
});

test('authenticated staff visiting pos login is redirected to pos dashboard', function () {
    $kasir = User::factory()->kasir()->create();

    $response = $this->actingAs($kasir)->get('/pos/login');
    $response->assertRedirect('/pos');
});

test('customer user cannot login through pos login endpoint', function () {
    $customer = User::factory()->customer()->create([
        'email' => 'pembeli@gmail.com',
        'password' => Hash::make('secret123'),
    ]);

    $response = $this->post('/pos/login', [
        'email' => 'pembeli@gmail.com',
        'password' => 'secret123',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

test('pos login with invalid password fails', function () {
    $kasir = User::factory()->kasir()->create([
        'email' => 'kasir.invalid@sanubari.co.id',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post('/pos/login', [
        'email' => 'kasir.invalid@sanubari.co.id',
        'password' => 'wrongpassword',
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

test('kasir user can successfully login through pos login and is redirected to pos', function () {
    $kasir = User::factory()->kasir()->create([
        'email' => 'kasir.valid@sanubari.co.id',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post('/pos/login', [
        'email' => 'kasir.valid@sanubari.co.id',
        'password' => 'password123',
    ]);

    $response->assertRedirect('/pos');
    $this->assertAuthenticatedAs($kasir);
});

test('pos logout logs out the user and redirects to pos login', function () {
    $kasir = User::factory()->kasir()->create();

    $response = $this->actingAs($kasir)->post('/pos/logout');
    $response->assertRedirect('/pos/login');
    $this->assertGuest();
});

test('customer user without staff role is redirected to pos login with warning', function () {
    $customer = User::factory()->customer()->create([
        'name' => 'Pelanggan Biasa',
        'email' => 'pelanggan@gmail.com',
    ]);

    $response = $this->actingAs($customer)->get('/pos');
    $response->assertRedirect('/pos/login');
    $response->assertSessionHas('warning');
});

test('kasir user can access pos dashboard', function () {
    $kasir = User::factory()->kasir()->create([
        'name' => 'Kasir Toko',
        'email' => 'kasirtoko@sanubari.co.id',
    ]);

    $response = $this->actingAs($kasir)->get('/pos');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pos')
        ->where('cashier.role', 'kasir')
        ->where('cashier.is_owner', false)
        ->where('staffList', [])
    );
});

test('admin user can access pos dashboard', function () {
    $admin = User::factory()->admin()->create([
        'name' => 'Admin Utama',
        'email' => 'adminutama@sanubari.co.id',
    ]);

    $response = $this->actingAs($admin)->get('/pos');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pos')
        ->where('cashier.role', 'admin')
        ->where('cashier.is_owner', false)
        ->where('staffList', [])
    );
});

test('owner user can access pos dashboard', function () {
    $owner = User::factory()->owner()->create([
        'name' => 'Owner Sanubari',
        'email' => 'ownerutama@sanubari.co.id',
    ]);

    $response = $this->actingAs($owner)->get('/pos');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pos')
        ->where('cashier.role', 'owner')
        ->where('cashier.is_owner', true)
        ->has('staffList')
    );
});

test('owner user can view staff list via get /pos/staff', function () {
    $owner = User::factory()->owner()->create();
    User::factory()->kasir()->create(['name' => 'Kasir Alpha']);

    $response = $this->actingAs($owner)->getJson('/pos/staff');
    $response->assertOk();
    $response->assertJsonStructure(['success', 'staff']);
    $names = collect($response->json('staff'))->pluck('name')->all();
    expect($names)->toContain('Kasir Alpha');
});

test('admin and kasir users cannot access, add, or delete staff (403 forbidden)', function () {
    $kasir = User::factory()->kasir()->create();
    $admin = User::factory()->admin()->create();
    $targetStaff = User::factory()->kasir()->create();

    foreach ([$kasir, $admin] as $user) {
        $resList = $this->actingAs($user)->getJson('/pos/staff');
        $resList->assertStatus(403);

        $resCreate = $this->actingAs($user)->postJson('/pos/staff', [
            'name' => 'Staff Ilegal',
            'email' => "ilegal_{$user->id}@sanubari.co.id",
            'password' => 'secret123',
            'role' => 'kasir',
        ]);
        $resCreate->assertStatus(403);

        $resDelete = $this->actingAs($user)->deleteJson("/pos/staff/{$targetStaff->id}");
        $resDelete->assertStatus(403);
    }
});

test('owner user can add a new staff member through pos and new staff can login immediately', function () {
    $owner = User::factory()->owner()->create();

    $payload = [
        'name' => 'Bambang Kasir Baru',
        'email' => 'bambang.kasir@sanubari.co.id',
        'password' => 'kasirpass123',
        'role' => 'kasir',
        'phone' => '081234567890',
    ];

    $response = $this->actingAs($owner)->postJson('/pos/staff', $payload);
    $response->assertStatus(201);
    $response->assertJson([
        'success' => true,
        'staff' => [
            'name' => 'Bambang Kasir Baru',
            'email' => 'bambang.kasir@sanubari.co.id',
            'role' => 'kasir',
        ],
    ]);

    // Verify user in DB
    $created = User::where('email', 'bambang.kasir@sanubari.co.id')->first();
    expect($created)->not->toBeNull();
    expect($created->role)->toBe('kasir');
    expect(Hash::check('kasirpass123', $created->password))->toBeTrue();
    expect($created->email_verified_at)->not->toBeNull();

    // Verify new staff can immediately login to POS
    auth()->logout();
    $loginRes = $this->post('/pos/login', [
        'email' => 'bambang.kasir@sanubari.co.id',
        'password' => 'kasirpass123',
    ]);
    $loginRes->assertRedirect('/pos');
    $this->assertAuthenticatedAs($created);
});

test('owner user can delete staff member but cannot delete self or superadmin', function () {
    $owner = User::factory()->owner()->create();
    $kasir = User::factory()->kasir()->create(['name' => 'Kasir Akan Dihapus']);

    // Attempt self-deletion should fail
    $resSelf = $this->actingAs($owner)->deleteJson("/pos/staff/{$owner->id}");
    $resSelf->assertStatus(422);

    // Delete staff should succeed
    $resDelete = $this->actingAs($owner)->deleteJson("/pos/staff/{$kasir->id}");
    $resDelete->assertOk();
    $resDelete->assertJson(['success' => true]);
    expect(User::find($kasir->id))->toBeNull();
});
